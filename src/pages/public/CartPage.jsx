import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  HiOutlineTrash, HiMinus, HiPlus, HiOutlineBookmark,
  HiOutlineShoppingBag, HiOutlineTag, HiX,
} from 'react-icons/hi';
import EmptyState from '../../components/common/EmptyState';
import Seo from '../../components/seo/Seo';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency, variantLabel } from '../../utils/format';

/** One line in the cart, shared by the active and saved-for-later lists */
const CartLine = ({ item, onQuantity, onRemove, onSave, saved }) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    className="cart-line"
  >
    <Link to={`/product/${item.slug}`} className="cart-line-image">
      {item.thumbnail ? <img src={item.thumbnail} alt={item.name} loading="lazy" /> : <span>🐾</span>}
    </Link>

    <div className="cart-line-body">
      <Link to={`/product/${item.slug}`} className="cart-line-name">{item.name}</Link>
      {variantLabel(item.variant) && <span className="cart-line-variant">{variantLabel(item.variant)}</span>}

      <div className="cart-line-price">
        <strong>{formatCurrency(item.price)}</strong>
        {item.mrp > item.price && <span className="cart-line-mrp">{formatCurrency(item.mrp)}</span>}
      </div>

      {item.maxStock > 0 && item.maxStock <= 5 && (
        <span className="cart-line-stock">Only {item.maxStock} left</span>
      )}

      <div className="cart-line-actions">
        {!saved && (
          <div className="qty-stepper qty-stepper-sm">
            <button
              type="button"
              onClick={() => onQuantity(item, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            ><HiMinus /></button>
            <span>{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantity(item, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              aria-label="Increase quantity"
            ><HiPlus /></button>
          </div>
        )}

        <button type="button" className="cart-line-link" onClick={() => onSave(item)}>
          <HiOutlineBookmark /> {saved ? 'Move to cart' : 'Save for later'}
        </button>

        <button type="button" className="cart-line-link is-danger" onClick={() => onRemove(item)}>
          <HiOutlineTrash /> Remove
        </button>
      </div>
    </div>

    <div className="cart-line-total">{formatCurrency(item.price * item.quantity)}</div>
  </motion.li>
);

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { settings } = useSettings();
  const {
    activeItems, savedItems, subtotal, isEmpty, coupon,
    updateQuantity, removeItem, toggleSaveForLater, applyCoupon, removeCoupon, refresh,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Pull the authoritative server cart on mount so prices/stock are current
  useEffect(() => { if (isAuthenticated) refresh(); }, [isAuthenticated, refresh]);

  const discount = coupon?.discount || 0;
  const shipping = subtotal >= (settings.freeShippingThreshold || 0) ? 0 : (settings.shippingCharge || 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * ((settings.taxRate || 0) / 100) * 100) / 100;
  const total = taxable + tax + shipping;
  const awayFromFreeShipping = (settings.freeShippingThreshold || 0) - subtotal;

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode.trim().toUpperCase());
    setApplyingCoupon(false);
  };

  if (isEmpty && savedItems.length === 0) {
    return (
      <div className="container-custom section-padding">
        <Seo title="Your Cart" noindex canonical="/cart" />
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's find something your pet will love."
          actionText="Start shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="container-custom section-padding">
      <Seo title="Your Cart" noindex canonical="/cart" />

      <div className="section-title" style={{ textAlign: 'left' }}>
        <h1 className="page-heading">Your Cart</h1>
        <p className="page-subheading">
          {activeItems.length} item{activeItems.length === 1 ? '' : 's'} ready to check out
        </p>
      </div>

      <div className="cart-layout">
        {/* ── Items ─────────────────────────────────────────────────── */}
        <div className="cart-items">
          {awayFromFreeShipping > 0 && (
            <div className="cart-shipping-nudge">
              <HiOutlineShoppingBag />
              Add <strong>{formatCurrency(awayFromFreeShipping)}</strong> more to unlock free delivery
              <span className="cart-shipping-track">
                <span
                  className="cart-shipping-fill"
                  style={{ width: `${Math.min(100, (subtotal / (settings.freeShippingThreshold || 1)) * 100)}%` }}
                />
              </span>
            </div>
          )}

          <ul className="cart-list">
            <AnimatePresence initial={false}>
              {activeItems.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  onQuantity={updateQuantity}
                  onRemove={removeItem}
                  onSave={toggleSaveForLater}
                />
              ))}
            </AnimatePresence>
          </ul>

          {savedItems.length > 0 && (
            <>
              <h2 className="cart-saved-heading">Saved for later ({savedItems.length})</h2>
              <ul className="cart-list">
                <AnimatePresence initial={false}>
                  {savedItems.map((item) => (
                    <CartLine
                      key={item.id}
                      item={item}
                      saved
                      onQuantity={updateQuantity}
                      onRemove={removeItem}
                      onSave={toggleSaveForLater}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </>
          )}

          <Link to="/shop" className="cart-continue">← Continue shopping</Link>
        </div>

        {/* ── Summary ───────────────────────────────────────────────── */}
        <aside className="cart-summary">
          <div className="cart-summary-inner">
            <h2>Order summary</h2>

            {isAuthenticated ? (
              coupon ? (
                <div className="cart-coupon-applied">
                  <span><HiOutlineTag /> <strong>{coupon.code}</strong> applied</span>
                  <button type="button" onClick={removeCoupon} aria-label="Remove coupon"><HiX /></button>
                </div>
              ) : (
                <form className="cart-coupon" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    aria-label="Coupon code"
                  />
                  <button type="submit" disabled={applyingCoupon || !couponCode.trim()}>
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </form>
              )
            ) : (
              <p className="cart-signin-note">
                <Link to="/login">Sign in</Link> to use coupons and save your cart.
              </p>
            )}

            <dl className="cart-totals">
              <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
              {discount > 0 && (
                <div className="is-discount"><dt>Coupon discount</dt><dd>− {formatCurrency(discount)}</dd></div>
              )}
              <div><dt>Tax (GST {settings.taxRate}%)</dt><dd>{formatCurrency(tax)}</dd></div>
              <div>
                <dt>Delivery</dt>
                <dd>{shipping === 0 ? <span className="is-free">FREE</span> : formatCurrency(shipping)}</dd>
              </div>
              <div className="cart-total-row"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
            </dl>

            <button
              type="button"
              className="btn-primary cart-checkout-btn"
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout')}
              disabled={activeItems.length === 0}
            >
              {isAuthenticated ? 'Proceed to checkout' : 'Sign in to check out'}
            </button>

            <p className="cart-secure-note">🔒 Secure payment via Razorpay — UPI, cards, netbanking &amp; COD</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
