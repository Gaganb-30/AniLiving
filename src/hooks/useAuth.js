import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { authService } from '../services/apiServices';
import { setCredentials, logout as logoutAction, updateUser } from '../redux/slices/authSlice';
import { clearWishlist } from '../redux/slices/wishlistSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { errorMessage } from '../utils/format';
import { useCart } from './useCart';
import { useWishlist } from './useWishlist';

/**
 * useAuth — sign in, sign up, Google sign-in and sign out.
 *
 * Every successful sign-in also merges the guest cart and loads the wishlist,
 * so the transition from browsing to signed-in never drops what the shopper
 * had already collected.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth);
  const { mergeGuestCart } = useCart();
  const { load: loadWishlist } = useWishlist();

  const afterLogin = useCallback(async (payload) => {
    dispatch(setCredentials(payload));
    // These run after the credentials land so the API interceptor has a token
    await mergeGuestCart();
    await loadWishlist();
  }, [dispatch, mergeGuestCart, loadWishlist]);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await authService.login(credentials);
      await afterLogin(data.data);
      toast.success(`Welcome back, ${data.data.user.firstName}!`);
      return data.data.user;
    } catch (err) {
      toast.error(errorMessage(err, 'Could not sign you in.'));
      throw err;
    }
  }, [afterLogin]);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await authService.register(payload);
      await afterLogin(data.data);
      toast.success('Account created. Welcome to AniLiving!');
      return data.data.user;
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your account.'));
      throw err;
    }
  }, [afterLogin]);

  /** Exchange a Google ID token (credential) for an AniLiving session */
  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const { data } = await authService.googleLogin(credential);
      await afterLogin(data.data);
      toast.success(`Welcome, ${data.data.user.firstName}!`);
      return data.data.user;
    } catch (err) {
      toast.error(errorMessage(err, 'Google sign-in failed.'));
      throw err;
    }
  }, [afterLogin]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, clear local state — the user asked to leave
    }
    dispatch(logoutAction());
    dispatch(clearCart());
    dispatch(clearWishlist());
    toast.success('Signed out');
  }, [dispatch]);

  return { user, isAuthenticated, accessToken, login, register, loginWithGoogle, logout, updateUser: (u) => dispatch(updateUser(u)) };
};

/**
 * Re-validate the persisted session once on app start.
 *
 * redux-persist restores `user` from localStorage, which could be stale (role
 * changed, account deactivated). A single /auth/me call on mount reconciles it;
 * a 401 is handled by the axios interceptor, which refreshes or signs out.
 */
export const useAuthBootstrap = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { load: loadWishlist } = useWishlist();
  const done = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || done.current) return;
    done.current = true;

    authService.getMe()
      .then(({ data }) => {
        dispatch(updateUser(data.data.user));
        loadWishlist();
      })
      .catch(() => {
        // Interceptor already handled refresh/logout
      });
  }, [isAuthenticated, dispatch, loadWishlist]);
};

export default useAuth;
