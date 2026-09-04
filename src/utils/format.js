/**
 * Formatting helpers shared across the storefront and admin panel.
 * Keeping these in one place is what stops ₹1,299 rendering three different
 * ways on three different screens.
 */

/** ₹1,299 — no decimals for whole rupees, two when there are paise */
export const formatCurrency = (value, { decimals } = {}) => {
  const n = Number(value) || 0;
  const showDecimals = decimals ?? (n % 1 !== 0);
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })}`;
};

/** Compact number for badges: 1.2k, 15k */
export const formatCompact = (value) => {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
  return `${(n / 100000).toFixed(1)}L`;
};

export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts,
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

/** "2 days ago" — used in review and order lists */
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const discountPercent = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

/** Order status → human label + colour token used by the status pill */
export const ORDER_STATUS = {
  pending: { label: 'Payment Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'primary' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'primary' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'error' },
  returned: { label: 'Returned', tone: 'error' },
  refunded: { label: 'Refunded', tone: 'muted' },
};

export const orderStatusLabel = (status) => ORDER_STATUS[status]?.label
  || String(status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const orderStatusTone = (status) => ORDER_STATUS[status]?.tone || 'muted';

/** The happy-path order journey, used to draw the tracking timeline */
export const ORDER_TIMELINE = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

/** Extract a readable message from an Axios error */
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => (
  err?.response?.data?.message
  || err?.response?.data?.errors?.[0]?.message
  || err?.message
  || fallback
);

/** Turn a Mongoose Map (or plain object) of variant attributes into "Color: Red · Size: L" */
export const variantLabel = (variant) => {
  if (!variant) return '';
  const entries = variant instanceof Map ? [...variant.entries()] : Object.entries(variant);
  return entries.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ');
};

/**
 * Best-effort mapping of a colour *name* to a CSS colour so swatches can render
 * without the admin supplying a hex code. Unknown names fall back to a neutral
 * chip with the name written inside it.
 */
const NAMED_COLORS = {
  black: '#111111', white: '#FFFFFF', grey: '#9CA3AF', gray: '#9CA3AF',
  silver: '#C0C0C0', red: '#DC2626', maroon: '#7F1D1D', pink: '#EC4899',
  orange: '#F97316', yellow: '#FACC15', gold: '#D4AF37', green: '#16A34A',
  olive: '#65A30D', teal: '#0D9488', blue: '#2563EB', navy: '#0047ae',
  purple: '#7C3AED', violet: '#8B5CF6', brown: '#78350F', beige: '#E8D8C3',
  cream: '#FFF5E9', tan: '#D2B48C', khaki: '#BDB76B', ivory: '#FFFFF0',
  charcoal: '#36454F', mustard: '#E1AD01', lavender: '#B57EDC',
};

export const colorToCss = (name) => {
  if (!name) return null;
  const raw = String(name).trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  const key = raw.toLowerCase().replace(/\s+/g, '');
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];
  // "Dark Blue" → try the last word ("blue")
  const lastWord = raw.toLowerCase().split(/\s+/).pop();
  return NAMED_COLORS[lastWord] || null;
};
