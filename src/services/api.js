import axios from "axios";
import { store } from "../redux/store";
import { setAccessToken, logout } from "../redux/slices/authSlice";

/**
 * Axios instance with:
 * - Base URL pointing to API
 * - Auth token injection via interceptors
 * - Automatic token refresh on 401
 * - Credentials for HTTP-only cookies
 */
const apiHost = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const baseURL = apiHost ? `${apiHost}/api` : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh-token or login requests
      if (
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post(
          "/auth/refresh-token",
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
