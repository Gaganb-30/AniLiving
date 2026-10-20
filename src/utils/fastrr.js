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
 * Resolve Fastrr target environment safely.
 * Priority: explicitly passed env -> VITE_FASTRR_ENV -> PROD build (production) -> staging
 */
export const resolveFastrrEnv = (env) => {
  if (env === 'production' || env === 'staging') return env;
  if (import.meta.env.VITE_FASTRR_ENV === 'production' || import.meta.env.VITE_FASTRR_ENV === 'staging') {
    return import.meta.env.VITE_FASTRR_ENV;
  }
  return import.meta.env.PROD ? 'production' : 'staging';
};

/**
 * Load Fastrr CSS and JS dynamically once when needed
 *
 * @param {'staging'|'production'} [env]
 * @returns {Promise<boolean>}
 */
export const loadFastrrAssets = (env) => {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const targetEnv = resolveFastrrEnv(env);
  const config = FASTRR_ASSETS[targetEnv] || FASTRR_ASSETS.production;

  // Check if an existing script is already in DOM
  const existing = document.querySelector(`script[src*="channels/shopify.js"]`);
  if (existing) {
    // If the existing script does not match the target environment (e.g. previously loaded staging), remove it
    if (existing.src !== config.js) {
      existing.remove();
      const existingCss = document.querySelector(`link[href*="shopify.css"]`);
      if (existingCss) existingCss.remove();
      try { delete window.HeadlessCheckout; } catch { window.HeadlessCheckout = undefined; }
      scriptPromise = null;
    } else if (window.HeadlessCheckout?.addToCart) {
      return Promise.resolve(true);
    }
  }

  if (scriptPromise) return scriptPromise;

  // 1. Ensure CSS is appended
  if (!document.querySelector(`link[href="${config.css}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = config.css;
    document.head.appendChild(link);
  }

  // 2. Load JS
  scriptPromise = new Promise((resolve) => {
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
  env,
}) => {
  if (!items || items.length === 0) {
    toast.error('Your cart is empty.');
    return;
  }

  const toastId = toast.loading('Connecting to checkout…');

  try {
    const targetEnv = resolveFastrrEnv(env);
    // 1. Load checkout assets
    const loaded = await loadFastrrAssets(targetEnv);
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
