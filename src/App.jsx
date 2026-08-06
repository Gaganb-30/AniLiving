import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// ---------------------------------------------------------------------------
// Route-level code splitting.
//
// The storefront's first paint only needs the home page; the dashboard and the
// whole admin panel are lazily loaded so a shopper never downloads the admin
// bundle. This is the single biggest lever on the Lighthouse performance score.
// ---------------------------------------------------------------------------

// Public
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ShopPage = lazy(() => import('./pages/public/ShopPage'));
const CategoriesPage = lazy(() => import('./pages/public/CategoriesPage'));
const BrandsPage = lazy(() => import('./pages/public/BrandsPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/public/CartPage'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/public/OrderSuccessPage'));
const OrderFailedPage = lazy(() => import('./pages/public/OrderFailedPage'));
const TrackOrderPage = lazy(() => import('./pages/public/TrackOrderPage'));
const SearchResultsPage = lazy(() => import('./pages/public/SearchResultsPage'));
const WishlistPage = lazy(() => import('./pages/public/WishlistPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// Policy pages share one module
const PolicyPages = () => import('./pages/public/PolicyPages');
const PrivacyPolicyPage = lazy(() => PolicyPages().then((m) => ({ default: m.PrivacyPolicyPage })));
const RefundPolicyPage = lazy(() => PolicyPages().then((m) => ({ default: m.RefundPolicyPage })));
const ShippingPolicyPage = lazy(() => PolicyPages().then((m) => ({ default: m.ShippingPolicyPage })));
const CancellationPolicyPage = lazy(() => PolicyPages().then((m) => ({ default: m.CancellationPolicyPage })));
const TermsPage = lazy(() => PolicyPages().then((m) => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() => PolicyPages().then((m) => ({ default: m.DisclaimerPage })));

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordModule = () => import('./pages/auth/ForgotPasswordPage');
const ForgotPasswordPage = lazy(() => ForgotPasswordModule());
const ResetPasswordPage = lazy(() => ForgotPasswordModule().then((m) => ({ default: m.ResetPasswordPage })));

// User dashboard
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardModule = () => import('./pages/dashboard/DashboardPages');
const DashboardHome = lazy(() => DashboardModule().then((m) => ({ default: m.DashboardHome })));
const ProfilePage = lazy(() => DashboardModule().then((m) => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => DashboardModule().then((m) => ({ default: m.OrdersPage })));
const OrderDetailsPage = lazy(() => DashboardModule().then((m) => ({ default: m.OrderDetailsPage })));
const AddressesPage = lazy(() => DashboardModule().then((m) => ({ default: m.AddressesPage })));
const ChangePasswordPage = lazy(() => DashboardModule().then((m) => ({ default: m.ChangePasswordPage })));

// Admin
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminOrdersModule = () => import('./pages/admin/AdminOrders');
const AdminOrders = lazy(() => AdminOrdersModule().then((m) => ({ default: m.AdminOrders })));
const AdminOrderDetail = lazy(() => AdminOrdersModule().then((m) => ({ default: m.AdminOrderDetail })));
const AdminCatalogueModule = () => import('./pages/admin/AdminCatalogue');
const AdminCategories = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminCategories })));
const AdminBrands = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminBrands })));
const AdminCoupons = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminCoupons })));
const AdminBanners = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminBanners })));
const AdminReviews = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminReviews })));
const AdminCustomers = lazy(() => AdminCatalogueModule().then((m) => ({ default: m.AdminCustomers })));

/** Suspense wrapper so every lazy route gets a consistent loading state */
const Page = ({ children }) => (
  <Suspense fallback={<div className="route-fallback"><LoadingSpinner size="lg" text="Loading…" /></div>}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Page><HomePage /></Page> },
      { path: 'shop', element: <Page><ShopPage /></Page> },
      { path: 'categories', element: <Page><CategoriesPage /></Page> },
      { path: 'brands', element: <Page><BrandsPage /></Page> },
      { path: 'product/:slug', element: <Page><ProductDetailPage /></Page> },
      { path: 'cart', element: <Page><CartPage /></Page> },
      { path: 'checkout', element: <Page><CheckoutPage /></Page> },
      { path: 'order-success', element: <Page><OrderSuccessPage /></Page> },
      { path: 'order-failed', element: <Page><OrderFailedPage /></Page> },
      { path: 'track-order', element: <Page><TrackOrderPage /></Page> },
      { path: 'search', element: <Page><SearchResultsPage /></Page> },
      { path: 'wishlist', element: <Page><WishlistPage /></Page> },

      // Info
      { path: 'about', element: <Page><AboutPage /></Page> },
      { path: 'contact', element: <Page><ContactPage /></Page> },
      { path: 'faq', element: <Page><FAQPage /></Page> },

      // Policies (required for Razorpay onboarding)
      { path: 'privacy-policy', element: <Page><PrivacyPolicyPage /></Page> },
      { path: 'refund-policy', element: <Page><RefundPolicyPage /></Page> },
      { path: 'shipping-policy', element: <Page><ShippingPolicyPage /></Page> },
      { path: 'cancellation-policy', element: <Page><CancellationPolicyPage /></Page> },
      { path: 'terms-and-conditions', element: <Page><TermsPage /></Page> },
      { path: 'disclaimer', element: <Page><DisclaimerPage /></Page> },

      // Auth
      { path: 'login', element: <Page><LoginPage /></Page> },
      { path: 'register', element: <Page><RegisterPage /></Page> },
      { path: 'forgot-password', element: <Page><ForgotPasswordPage /></Page> },
      { path: 'reset-password/:token', element: <Page><ResetPasswordPage /></Page> },

      // User dashboard
      {
        path: 'dashboard',
        element: <Page><DashboardLayout /></Page>,
        children: [
          { index: true, element: <Page><DashboardHome /></Page> },
          { path: 'profile', element: <Page><ProfilePage /></Page> },
          { path: 'orders', element: <Page><OrdersPage /></Page> },
          { path: 'orders/:id', element: <Page><OrderDetailsPage /></Page> },
          { path: 'wishlist', element: <Page><WishlistPage /></Page> },
          { path: 'addresses', element: <Page><AddressesPage /></Page> },
          { path: 'change-password', element: <Page><ChangePasswordPage /></Page> },
        ],
      },

      { path: '*', element: <Page><NotFoundPage /></Page> },
    ],
  },

  // Admin panel — its own shell, outside the storefront chrome
  {
    path: '/admin',
    element: <Page><AdminLayout /></Page>,
    children: [
      { index: true, element: <Page><AdminDashboard /></Page> },
      { path: 'products', element: <Page><AdminProducts /></Page> },
      { path: 'products/new', element: <Page><AdminProductForm /></Page> },
      { path: 'products/:id', element: <Page><AdminProductForm /></Page> },
      { path: 'inventory', element: <Page><AdminInventory /></Page> },
      { path: 'categories', element: <Page><AdminCategories /></Page> },
      { path: 'brands', element: <Page><AdminBrands /></Page> },
      { path: 'orders', element: <Page><AdminOrders /></Page> },
      { path: 'orders/:id', element: <Page><AdminOrderDetail /></Page> },
      { path: 'customers', element: <Page><AdminCustomers /></Page> },
      { path: 'reviews', element: <Page><AdminReviews /></Page> },
      { path: 'coupons', element: <Page><AdminCoupons /></Page> },
      { path: 'banners', element: <Page><AdminBanners /></Page> },
      { path: 'settings', element: <Page><AdminSettings /></Page> },
    ],
  },
]);

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1B2A4A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '10px 16px',
          },
          success: { iconTheme: { primary: '#F7931E', secondary: '#fff' } },
        }}
      />
    </HelmetProvider>
  );
}

export default App;
