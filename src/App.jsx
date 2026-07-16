import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import CategoriesPage from './pages/public/CategoriesPage';
import BrandsPage from './pages/public/BrandsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderSuccessPage from './pages/public/OrderSuccessPage';
import OrderFailedPage from './pages/public/OrderFailedPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import WishlistPage from './pages/public/WishlistPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import NotFoundPage from './pages/public/NotFoundPage';
import {
  PrivacyPolicyPage, RefundPolicyPage, ShippingPolicyPage,
  CancellationPolicyPage, TermsPage, DisclaimerPage,
} from './pages/public/PolicyPages';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage, { ResetPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import {
  DashboardHome, ProfilePage, OrdersPage,
  AddressesPage, ChangePasswordPage,
} from './pages/dashboard/DashboardPages';

// Admin Pages
import {
  AdminDashboard, AdminProducts, AdminCategories,
  AdminBrands, AdminOrders, AdminCustomers,
  AdminReviews, AdminCoupons, AdminBanners, AdminSettings,
} from './pages/admin/AdminPages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Public pages
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'product/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      { path: 'order-failed', element: <OrderFailedPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'search', element: <SearchResultsPage /> },

      // Info pages
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FAQPage /> },

      // Policy pages
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'refund-policy', element: <RefundPolicyPage /> },
      { path: 'shipping-policy', element: <ShippingPolicyPage /> },
      { path: 'cancellation-policy', element: <CancellationPolicyPage /> },
      { path: 'terms-and-conditions', element: <TermsPage /> },
      { path: 'disclaimer', element: <DisclaimerPage /> },

      // Auth pages (inside main layout for consistent branding)
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },

      // User Dashboard (nested inside MainLayout)
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'addresses', element: <AddressesPage /> },
          { path: 'change-password', element: <ChangePasswordPage /> },
        ],
      },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Admin layout (separate from main layout)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'brands', element: <AdminBrands /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'banners', element: <AdminBanners /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
]);

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;
