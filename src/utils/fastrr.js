import { fastrrService } from '../services/apiServices';
import { errorMessage } from './format';
import toast from 'react-hot-toast';

/**
 * Fastrr Checkout Integration Helper
 *
 * Fastrr (by Shiprocket) is a headless 1-click checkout.
 * Storefront generates an access token for the cart/item, then triggers
 * `HeadlessCheckout.addToCart(event, token)`.
 */

const FASTRR_ASSETS = {
  staging: {
    css: 'https://customcheckoutfastrr.netlify.app/assets/styles/shopify.css',
    js: 'https://customcheckoutfastrr.netlify.app/assets/js/channels/shopify.js',
  },
  production: {
    css: 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css',
    js: 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js',
  },
};

let scriptPromise = null;

/**
 * Load Fastrr CSS and JS dynamically once when needed
 *
 * @param {'staging'|'production'} [env='staging']
 * @returns {Promise<boolean>}
 */
export const loadFastrrAssets = (env = 'staging') => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.HeadlessCheckout?.addToCart) return Promise.resolve(true);

  if (scriptPromise) return scriptPromise;

  const config = FASTRR_ASSETS[env] || FASTRR_ASSETS.staging;

  // 1. Ensure CSS is appended
  if (!document.querySelector(`link[href*="shopify.css"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = config.css;
    document.head.appendChild(link);
  }

  // 2. Load JS
  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src*="channels/shopify.js"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      if (window.HeadlessCheckout) return resolve(true);
    }

    const script = document.createElement('script');
    script.src = config.js;
    script.async = true;
    script.onload = () => {
      // Allow Fastrr IIFE to resolve HeadlessCheckout object
      setTimeout(() => {
        resolve(true);
      }, 100);
    };
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};

/**
 * Initiate Fastrr 1-Click Checkout
 *
 * @param {object} params
 * @param {Array<{ productId: string, variantId?: string, quantity: number }>} params.items
 * @param {string} [params.redirectUrl]
 * @param {MouseEvent} [params.event]
 * @param {'staging'|'production'} [params.env]
 */
export const startFastrrCheckout = async ({
  items = [],
  redirectUrl,
  event,
  env = 'staging',
}) => {
  if (!items || items.length === 0) {
    toast.error('Your cart is empty.');
    return;
  }

  const toastId = toast.loading('Connecting to checkout…');

  try {
    // 1. Load checkout assets
    const loaded = await loadFastrrAssets(env);
    if (!loaded) {
      toast.dismiss(toastId);
      toast.error('Could not load checkout modal. Please check your connection.');
      return;
    }

    // 2. Generate token from backend
    const currentOrigin = window.location.origin;
    const finalRedirectUrl = redirectUrl || `${currentOrigin}/order-success`;

    const { data } = await fastrrService.getCheckoutToken({
      items: items.map((it) => ({
        productId: it.productId || it.id || it.product?._id,
        variantId: it.variantId || it.variant?._id || it.productId || it.id,
        quantity: it.quantity || 1,
      })),
      redirectUrl: finalRedirectUrl,
    });

    const token = data?.data?.token;
    if (!token) {
      throw new Error('Did not receive checkout token.');
    }

    toast.dismiss(toastId);

    // 3. Launch Fastrr Headless Checkout
    if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === 'function') {
      window.HeadlessCheckout.addToCart(event || window.event, token);
    } else {
      // Retry in 250ms if script is still initializing
      setTimeout(() => {
        if (window.HeadlessCheckout?.addToCart) {
          window.HeadlessCheckout.addToCart(event || window.event, token);
        } else {
          toast.error('Checkout could not be opened. Please reload and try again.');
        }
      }, 250);
    }

    return data.data;
  } catch (err) {
    toast.dismiss(toastId);
    console.error('Fastrr checkout error:', err);
    const safeMsg = err?.response?.data?.message || 'Error from payment provider. Please try again.';
    toast.error(safeMsg);
    throw err;
  }
};

export default startFastrrCheckout;
