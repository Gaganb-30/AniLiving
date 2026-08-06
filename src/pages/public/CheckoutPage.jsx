import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  HiOutlineLocationMarker, HiOutlineCreditCard, HiOutlineCash,
  HiOutlinePlus, HiCheckCircle,
} from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { orderService, userService } from '../../services/apiServices';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { formatCurrency, variantLabel, errorMessage } from '../../utils/format';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

/**
 * CheckoutPage
 *
 * A delivery address with a valid phone number is mandatory before any order
 * can be placed — enforced here for a fast, friendly experience and again on
 * the server, which is the check that actually counts.
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { settings, integrations } = useSettings();
  const { activeItems, subtotal, coupon, isEmpty, refresh, emptyCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      phone: user?.phone || '',
      addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
      type: 'home', isDefault: true,
    },
  });

  // -------------------------------------------------------------------
  // Load addresses + a fresh cart
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([userService.getAddresses(), refresh()])
      .then(([{ data }]) => {
        const list = data.data?.addresses || [];
        setAddresses(list);
        const preferred = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(preferred?._id || null);
        setShowAddressForm(list.length === 0);
      })
      .catch(() => setShowAddressForm(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // COD can be switched off by the admin; fall back to online payment
  useEffect(() => {
    if (paymentMethod === 'cod' && settings.codEnabled === false) setPaymentMethod('razorpay');
  }, [settings.codEnabled, paymentMethod]);

  // -------------------------------------------------------------------
  // Totals — mirrored server-side, shown here so there are no surprises
  // -------------------------------------------------------------------
  const totals = useMemo(() => {
    const discount = coupon?.discount || 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * ((settings.taxRate || 0) / 100) * 100) / 100;
    const shipping = subtotal >= (settings.freeShippingThreshold || 0) ? 0 : (settings.shippingCharge || 0);
    return { discount, tax, shipping, total: taxable + tax + shipping };
  }, [subtotal, coupon, settings]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;
  if (loading) {
    return <div className="container-custom section-padding"><LoadingSpinner size="lg" text="Preparing checkout…" /></div>;
  }
  if (isEmpty) return <Navigate to="/cart" replace />;

  // -------------------------------------------------------------------
  // Saving a new address
  // -------------------------------------------------------------------
  const saveAddress = async (values) => {
    try {
      const { data } = await userService.addAddress(values);
      const list = data.data?.addresses || [];
      setAddresses(list);
      setSelectedAddressId(list[list.length - 1]?._id || list.find((a) => a.isDefault)?._id);
      setShowAddressForm(false);
      reset();
      toast.success('Address saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save that address.'));
    }
  };

  // -------------------------------------------------------------------
  // Placing the order
  // -------------------------------------------------------------------
  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please add a delivery address first.');
      setShowAddressForm(true);
      return;
    }
    if (!selectedAddress.phone) {
      toast.error('A contact number is required for delivery.');
      return;
    }

    setPlacing(true);
    try {
      const { data } = await orderService.createOrder({
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country || 'India',
        },
        paymentMethod,
        couponCode: coupon?.code,
      });

      const { order, razorpayOrder } = data.data;

      // Cash on delivery — nothing more to do
      if (paymentMethod === 'cod') {
        await emptyCart();
        navigate(`/order-success?order=${order._id}`, { replace: true });
        return;
      }

      // Online payment — hand off to Razorpay, then verify server-side
      await openRazorpayCheckout({
        razorpayOrder,
        order,
        user,
        settings,
        onSuccess: async (response) => {
          try {
            await orderService.verifyPayment(order._id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            await emptyCart();
            navigate(`/order-success?order=${order._id}`, { replace: true });
          } catch (err) {
            toast.error(errorMessage(err, 'We could not verify your payment.'));
            navigate(`/order-failed?order=${order._id}`, { replace: true });
          }
        },
        onFailure: () => {
          navigate(`/order-failed?order=${order._id}`, { replace: true });
        },
        onDismiss: () => {
          setPlacing(false);
          toast('Payment cancelled — your order is saved and can be paid from My Orders.', { icon: 'ℹ️' });
          navigate(`/order-failed?order=${order._id}`, { replace: true });
        },
      });
    } catch (err) {
      toast.error(errorMessage(err, 'We could not place your order.'));
      setPlacing(false);
    }
  };

  const codDisabled = settings.codEnabled === false;
  const onlineDisabled = integrations?.razorpayEnabled === false;

  return (
    <div className="container-custom section-padding">
      <Seo title="Checkout" noindex canonical="/checkout" />

      <div className="section-title" style={{ textAlign: 'left' }}>
        <h1 className="page-heading">Checkout</h1>
        <p className="page-subheading">Almost there — just confirm where it&apos;s going and how you&apos;d like to pay.</p>
      </div>

      <div className="checkout-layout">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-main">
          {/* ── Delivery address ─────────────────────────────────── */}
          <section className="checkout-card">
            <header className="checkout-card-head">
              <h2><HiOutlineLocationMarker /> Delivery address</h2>
              {addresses.length > 0 && !showAddressForm && (
                <button type="button" className="checkout-link" onClick={() => setShowAddressForm(true)}>
                  <HiOutlinePlus /> Add new
                </button>
              )}
            </header>

            {addresses.length > 0 && (
              <div className="address-options">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className={`address-option ${selectedAddressId === address._id ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                    />
                    <span className="address-option-body">
                      <strong>
                        {address.fullName}
                        <em className="address-type">{address.type}</em>
                        {address.isDefault && <em className="address-default">Default</em>}
                      </strong>
                      <span>
                        {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                        {address.city}, {address.state} — {address.pincode}
                      </span>
                      <span className="address-phone">📞 {address.phone}</span>
                    </span>
                    {selectedAddressId === address._id && <HiCheckCircle className="address-check" />}
                  </label>
                ))}
              </div>
            )}

            {showAddressForm && (
              <form className="address-form" onSubmit={handleSubmit(saveAddress)}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="fullName">Full name *</label>
                    <input
                      id="fullName"
                      {...register('fullName', { required: 'Full name is required' })}
                      placeholder="Priya Sharma"
                    />
                    {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Mobile number *</label>
                    <input
                      id="phone"
                      inputMode="numeric"
                      {...register('phone', {
                        required: 'A mobile number is required for delivery',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="addressLine1">Address line 1 *</label>
                  <input
                    id="addressLine1"
                    {...register('addressLine1', { required: 'Address is required' })}
                    placeholder="Flat / House no., Building, Street"
                  />
                  {errors.addressLine1 && <span className="form-error">{errors.addressLine1.message}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="addressLine2">Address line 2</label>
                  <input id="addressLine2" {...register('addressLine2')} placeholder="Area, Landmark (optional)" />
                </div>

                <div className="form-row form-row-3">
                  <div className="form-field">
                    <label htmlFor="city">City *</label>
                    <input id="city" {...register('city', { required: 'City is required' })} />
                    {errors.city && <span className="form-error">{errors.city.message}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="state">State *</label>
                    <select id="state" {...register('state', { required: 'State is required' })}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                    {errors.state && <span className="form-error">{errors.state.message}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      id="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      {...register('pincode', {
                        required: 'Pincode is required',
                        pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' },
                      })}
                    />
                    {errors.pincode && <span className="form-error">{errors.pincode.message}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="type">Address type</label>
                    <select id="type" {...register('type')}>
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <label className="form-check">
                    <input type="checkbox" {...register('isDefault')} />
                    Make this my default address
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save address</button>
                  {addresses.length > 0 && (
                    <button type="button" className="btn-secondary" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* ── Payment ──────────────────────────────────────────── */}
          <section className="checkout-card">
            <header className="checkout-card-head">
              <h2><HiOutlineCreditCard /> Payment method</h2>
            </header>

            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'razorpay' ? 'is-selected' : ''} ${onlineDisabled ? 'is-disabled' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  disabled={onlineDisabled}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <span className="payment-option-body">
                  <strong><HiOutlineCreditCard /> Pay online</strong>
                  <span>UPI, credit &amp; debit cards, netbanking, wallets and EMI — all through Razorpay.</span>
                  {onlineDisabled && <em>Temporarily unavailable</em>}
                </span>
              </label>

              <label className={`payment-option ${paymentMethod === 'cod' ? 'is-selected' : ''} ${codDisabled ? 'is-disabled' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  disabled={codDisabled}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span className="payment-option-body">
                  <strong><HiOutlineCash /> Cash on delivery</strong>
                  <span>Pay in cash when your order arrives.</span>
                  {codDisabled && <em>Currently unavailable</em>}
                </span>
              </label>
            </div>
          </section>
        </motion.div>

        {/* ── Order summary ──────────────────────────────────────── */}
        <aside className="checkout-summary">
          <div className="checkout-summary-inner">
            <h2>Order summary</h2>

            <ul className="checkout-items">
              {activeItems.map((item) => (
                <li key={item.id}>
                  <span className="checkout-item-image">
                    {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : '🐾'}
                    <em>{item.quantity}</em>
                  </span>
                  <span className="checkout-item-body">
                    <strong>{item.name}</strong>
                    {variantLabel(item.variant) && <span>{variantLabel(item.variant)}</span>}
                  </span>
                  <span className="checkout-item-price">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="cart-totals">
              <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
              {totals.discount > 0 && (
                <div className="is-discount">
                  <dt>Discount{coupon?.code ? ` (${coupon.code})` : ''}</dt>
                  <dd>− {formatCurrency(totals.discount)}</dd>
                </div>
              )}
              <div><dt>Tax (GST {settings.taxRate}%)</dt><dd>{formatCurrency(totals.tax)}</dd></div>
              <div>
                <dt>Delivery</dt>
                <dd>{totals.shipping === 0 ? <span className="is-free">FREE</span> : formatCurrency(totals.shipping)}</dd>
              </div>
              <div className="cart-total-row"><dt>Payable</dt><dd>{formatCurrency(totals.total)}</dd></div>
            </dl>

            <button
              type="button"
              className="btn-primary checkout-place-btn"
              onClick={placeOrder}
              disabled={placing || !selectedAddress}
            >
              {placing
                ? 'Processing…'
                : paymentMethod === 'cod'
                  ? `Place order · ${formatCurrency(totals.total)}`
                  : `Pay ${formatCurrency(totals.total)}`}
            </button>

            {!selectedAddress && (
              <p className="checkout-warning">Add a delivery address to continue.</p>
            )}

            <p className="cart-secure-note">
              🔒 Payments are processed securely by Razorpay. By placing this order you agree to our{' '}
              <Link to="/terms-and-conditions">Terms</Link> and <Link to="/refund-policy">Refund Policy</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
