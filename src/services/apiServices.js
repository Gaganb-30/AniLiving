import api from './api';

/** ============================================================
 *  AUTH SERVICE
 *  ============================================================ */
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
};

/** ============================================================
 *  USER SERVICE
 *  ============================================================ */
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  // Addresses
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  // Wishlist
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
};

/** ============================================================
 *  PRODUCT SERVICE
 *  ============================================================ */
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getNewArrivals: (limit = 8) => api.get('/products/new-arrivals', { params: { limit } }),
  getBestSellers: (limit = 8) => api.get('/products/best-sellers', { params: { limit } }),
  getTrending: (limit = 8) => api.get('/products/trending', { params: { limit } }),
  getFlashDeals: (limit = 8) => api.get('/products/flash-deals', { params: { limit } }),
  // Admin
  getAdminProducts: (params) => api.get('/products/admin/all', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  duplicateProduct: (id) => api.post(`/products/${id}/duplicate`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateStatus: (ids, updates) => api.post('/products/bulk-status', { ids, updates }),
};

/** ============================================================
 *  CATEGORY SERVICE
 *  ============================================================ */
export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  // Admin
  getAdminCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

/** ============================================================
 *  BRAND SERVICE
 *  ============================================================ */
export const brandService = {
  getBrands: () => api.get('/brands'),
  getBrandBySlug: (slug) => api.get(`/brands/${slug}`),
  // Admin
  getAdminBrands: () => api.get('/brands/admin/all'),
  createBrand: (data) => api.post('/brands', data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
};

/** ============================================================
 *  ORDER SERVICE
 *  ============================================================ */
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  verifyPayment: (orderId, data) => api.post(`/orders/${orderId}/verify-payment`, data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (orderNumber) => api.get(`/orders/${orderNumber}/track`),
  // Admin
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

/** ============================================================
 *  CART SERVICE
 *  ============================================================ */
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  toggleSaveForLater: (itemId) => api.patch(`/cart/${itemId}/save-for-later`),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
  removeCoupon: () => api.delete('/cart/remove-coupon'),
};

/** ============================================================
 *  REVIEW SERVICE
 *  ============================================================ */
export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  // Admin
  getAllReviews: (params) => api.get('/reviews', { params }),
  replyToReview: (id, comment) => api.put(`/reviews/${id}/reply`, { comment }),
  toggleApproval: (id) => api.patch(`/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

/** ============================================================
 *  COUPON SERVICE
 *  ============================================================ */
export const couponService = {
  validateCoupon: (code, orderTotal) => api.post('/coupons/validate', { code, orderTotal }),
  // Admin
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};

/** ============================================================
 *  BANNER SERVICE
 *  ============================================================ */
export const bannerService = {
  getBanners: () => api.get('/banners'),
  // Admin
  getAdminBanners: () => api.get('/banners/admin/all'),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

/** ============================================================
 *  SETTINGS SERVICE
 *  ============================================================ */
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

/** ============================================================
 *  SEARCH SERVICE
 *  ============================================================ */
export const searchService = {
  search: (q, limit = 10) => api.get('/search', { params: { q, limit } }),
  getPopularSearches: () => api.get('/search/popular'),
};

/** ============================================================
 *  DASHBOARD SERVICE (ADMIN)
 *  ============================================================ */
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

/** ============================================================
 *  USER ADMIN SERVICE
 *  ============================================================ */
export const userAdminService = {
  getAllUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};
