/**
 * Razorpay Checkout helper.
 *
 * The checkout widget is a third-party script we deliberately load on demand —
 * pulling it in on every page would cost every visitor a network request they
 * mostly never need. It is loaded once, the first time someone reaches the
 * payment step, and cached thereafter.
 */

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loader = null;

/** Load checkout.js once; resolves true when window.Razorpay is available */
export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!loader) {
    loader = new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => { loader = null; resolve(false); };
      document.body.appendChild(script);
    });
  }
  return loader;
};

/**
 * Open the Razorpay checkout modal.
 *
 * @param {object}   params
 * @param {object}   params.razorpayOrder  { id, amount, currency, key } from our API
 * @param {object}   params.order          Our own order document
 * @param {object}   params.user           Prefills name/email/contact
 * @param {Function} params.onSuccess      Receives the payment response for server verification
 * @param {Function} params.onDismiss      Called when the shopper closes the modal
 * @param {Function} params.onFailure      Called on an explicit payment failure
 */
export const openRazorpayCheckout = async ({
  razorpayOrder, order, user, settings = {}, onSuccess, onDismiss, onFailure,
}) => {
  const ready = await loadRazorpayScript();
  if (!ready) {
    throw new Error('Could not load the payment gateway. Please check your connection and try again.');
  }

  const options = {
    key: razorpayOrder.key,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency || 'INR',
    name: settings.siteName || 'AniLiving',
    description: `Order ${order.orderNumber}`,
    image: settings.logo || undefined,
    order_id: razorpayOrder.id,
    // Razorpay itself surfaces UPI, cards, netbanking, wallets and EMI —
    // we never build separate payment methods for those.
    handler: (response) => onSuccess?.(response),
    prefill: {
      name: order.shippingAddress?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      contact: order.shippingAddress?.phone || user?.phone || '',
    },
    notes: { orderId: order._id, orderNumber: order.orderNumber },
    theme: { color: '#F7931E' },
    modal: {
      ondismiss: () => onDismiss?.(),
      confirm_close: true,
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.on('payment.failed', (response) => onFailure?.(response.error));
  checkout.open();
  return checkout;
};

export default openRazorpayCheckout;
