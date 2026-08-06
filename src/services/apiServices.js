import api from './api';

/** ============================================================
 *  AUTH
 *  ============================================================ */
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
};

/** ============================================================
 *  USER
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
 *  PRODUCTS
 *  ============================================================ */
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getFilters: (params) => api.get('/products/filters', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getNewArrivals: (limit = 8) => api.get('/products/new-arrivals', { params: { limit } }),
  getBestSellers: (limit = 8) => api.get('/products/best-sellers', { params: { limit } }),
  getTrending: (limit = 8) => api.get('/products/trending', { params: { limit } }),
  getFlashDeals: (limit = 8) => api.get('/products/flash-deals', { params: { limit } }),

  // Admin
  getAdminProducts: (params) => api.get('/products/admin/all', { params }),
  getAdminProduct: (id) => api.get(`/products/admin/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  duplicateProduct: (id) => api.post(`/products/${id}/duplicate`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateStatus: (ids, updates) => api.post('/products/bulk-status', { ids, updates }),
  // Inventory
  getInventory: (params) => api.get('/products/admin/inventory', { params }),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  // Import / export
  exportProducts: () => api.get('/products/admin/export', { responseType: 'blob' }),
  importProducts: (csv, updateExisting = true) => api.post('/products/admin/import', { csv, updateExisting }),
};

/** ============================================================
 *  CATEGORIES
 *  ============================================================ */
export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  getAdminCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

/** ============================================================
 *  BRANDS
 *  ============================================================ */
export const brandService = {
  getBrands: () => api.get('/brands'),
  getBrandBySlug: (slug) => api.get(`/brands/${slug}`),
  getAdminBrands: () => api.get('/brands/admin/all'),
  createBrand: (data) => api.post('/brands', data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
};

/** ============================================================
 *  ORDERS
 *  ============================================================ */
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  verifyPayment: (orderId, data) => api.post(`/orders/${orderId}/verify-payment`, data),
  retryPayment: (orderId) => api.post(`/orders/${orderId}/retry-payment`),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
  // Admin
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  getPaymentLogs: (id) => api.get(`/orders/${id}/payment-logs`),
};

/** ============================================================
 *  CART
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
 *  REVIEWS
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
 *  COUPONS
 *  ============================================================ */
export const couponService = {
  validateCoupon: (code, orderTotal) => api.post('/coupons/validate', { code, orderTotal }),
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};

/** ============================================================
 *  BANNERS
 *  ============================================================ */
export const bannerService = {
  getBanners: () => api.get('/banners'),
  getAdminBanners: () => api.get('/banners/admin/all'),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

/** ============================================================
 *  SETTINGS
 *  ============================================================ */
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  refreshSitemap: () => api.post('/settings/sitemap/refresh'),
};

/** ============================================================
 *  SEARCH
 *  ============================================================ */
export const searchService = {
  search: (q, limit = 8) => api.get('/search', { params: { q, limit } }),
  getPopularSearches: () => api.get('/search/popular'),
};

/** ============================================================
 *  ADMIN DASHBOARD & USERS
 *  ============================================================ */
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

export const userAdminService = {
  getAllUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};

/**
 * Trigger a browser download from a blob response (invoice PDF, CSV export).
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
