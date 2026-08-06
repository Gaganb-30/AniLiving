import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { cartService } from '../services/apiServices';
import {
  setCart, setCartLoading, clearCart as clearCartAction,
  addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart,
} from '../redux/slices/cartSlice';
import { errorMessage } from '../utils/format';

/**
 * useCart — one API for the cart regardless of who's holding it.
 *
 * Signed-out shoppers get a cart persisted in localStorage via redux-persist;
 * signed-in shoppers get the server cart. Both are normalised to the same item
 * shape so components never branch on auth state. `mergeGuestCart` pushes the
 * local cart to the server after login so nothing is lost at the door.
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, guestCart, coupon, loading } = useSelector((state) => state.cart);

  // -------------------------------------------------------------------
  // Normalised view
  // -------------------------------------------------------------------
  const cartItems = useMemo(() => {
    if (isAuthenticated) {
      return (items || []).map((item) => ({
        id: item._id,
        productId: item.product?._id || item.product,
        product: item.product,
        name: item.product?.name,
        slug: item.product?.slug,
        thumbnail: item.product?.thumbnail,
        price: item.price,
        mrp: item.product?.mrp,
        quantity: item.quantity,
        variant: item.variant,
        variantId: item.variantId,
        savedForLater: item.savedForLater,
        maxStock: item.variantId
          ? item.product?.variants?.find((v) => v._id === item.variantId)?.stock ?? item.product?.stock ?? 0
          : item.product?.stock ?? 0,
      }));
    }
    return (guestCart || []).map((item, index) => ({
      id: `guest-${index}`,
      index,
      productId: item.productId,
      product: item.product,
      name: item.product?.name,
      slug: item.product?.slug,
      thumbnail: item.thumbnail || item.product?.thumbnail,
      price: item.price,
      mrp: item.product?.mrp,
      quantity: item.quantity,
      variant: item.variant,
      variantId: item.variantId,
      savedForLater: false,
      maxStock: item.maxStock ?? 99,
    }));
  }, [isAuthenticated, items, guestCart]);

  const activeItems = useMemo(() => cartItems.filter((i) => !i.savedForLater), [cartItems]);
  const savedItems = useMemo(() => cartItems.filter((i) => i.savedForLater), [cartItems]);

  const count = useMemo(
    () => activeItems.reduce((sum, i) => sum + i.quantity, 0),
    [activeItems],
  );

  const subtotal = useMemo(
    () => activeItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [activeItems],
  );

  // -------------------------------------------------------------------
  // Operations
  // -------------------------------------------------------------------
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const { data } = await cartService.getCart();
      dispatch(setCart(data.data.cart));
      return data.data.cart;
    } catch {
      return null;
    }
  }, [isAuthenticated, dispatch]);

  /**
   * Add a product (optionally a specific variant) to the cart.
   * @param {object} product
   * @param {{ quantity?: number, variantId?: string, variant?: object, thumbnail?: string, price?: number, maxStock?: number }} options
   */
  const addItem = useCallback(async (product, options = {}) => {
    const {
      quantity = 1, variantId = null, variant = null,
      thumbnail, price, maxStock,
    } = options;

    if (isAuthenticated) {
      dispatch(setCartLoading(true));
      try {
        const { data } = await cartService.addToCart({
          productId: product._id, quantity, variantId, variant,
        });
        dispatch(setCart(data.data.cart));
        toast.success('Added to cart');
        return true;
      } catch (err) {
        toast.error(errorMessage(err, 'Could not add this item to your cart.'));
        return false;
      } finally {
        dispatch(setCartLoading(false));
      }
    }

    // Guest cart — keep just enough of the product to render the cart page
    dispatch(addToGuestCart({
      productId: product._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        thumbnail: thumbnail || product.thumbnail,
        mrp: product.mrp,
        price: product.price,
      },
      thumbnail: thumbnail || product.thumbnail,
      quantity,
      variant,
      variantId,
      price: price ?? product.price,
      maxStock: maxStock ?? product.stock ?? 99,
    }));
    toast.success('Added to cart');
    return true;
  }, [isAuthenticated, dispatch]);

  const updateQuantity = useCallback(async (item, quantity) => {
    if (quantity < 1) return;
    if (quantity > item.maxStock) {
      toast.error(`Only ${item.maxStock} available`);
      return;
    }

    if (isAuthenticated) {
      try {
        const { data } = await cartService.updateCartItem(item.id, quantity);
        dispatch(setCart(data.data.cart));
      } catch (err) {
        toast.error(errorMessage(err));
      }
    } else {
      dispatch(updateGuestCartItem({ index: item.index, quantity }));
    }
  }, [isAuthenticated, dispatch]);

  const removeItem = useCallback(async (item) => {
    if (isAuthenticated) {
      try {
        const { data } = await cartService.removeFromCart(item.id);
        dispatch(setCart(data.data.cart));
        toast.success('Removed from cart');
      } catch (err) {
        toast.error(errorMessage(err));
      }
    } else {
      dispatch(removeFromGuestCart(item.index));
      toast.success('Removed from cart');
    }
  }, [isAuthenticated, dispatch]);

  const toggleSaveForLater = useCallback(async (item) => {
    if (!isAuthenticated) {
      toast('Sign in to save items for later', { icon: '🔒' });
      return;
    }
    try {
      const { data } = await cartService.toggleSaveForLater(item.id);
      dispatch(setCart(data.data.cart));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [isAuthenticated, dispatch]);

  const emptyCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
        dispatch(clearCartAction());
      } catch (err) {
        toast.error(errorMessage(err));
      }
    } else {
      dispatch(clearGuestCart());
    }
  }, [isAuthenticated, dispatch]);

  const applyCoupon = useCallback(async (code) => {
    try {
      const { data } = await cartService.applyCoupon(code);
      if (data.data?.cart) dispatch(setCart(data.data.cart));
      toast.success(data.message || 'Coupon applied');
      return data.data;
    } catch (err) {
      toast.error(errorMessage(err, 'That coupon could not be applied.'));
      return null;
    }
  }, [dispatch]);

  const removeCoupon = useCallback(async () => {
    try {
      const { data } = await cartService.removeCoupon();
      if (data.data?.cart) dispatch(setCart(data.data.cart));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [dispatch]);

  /**
   * Push a guest cart to the server after sign-in, then clear the local copy.
   * Failures are swallowed per item so one unavailable product doesn't lose
   * the rest of the basket.
   */
  const mergeGuestCart = useCallback(async () => {
    const pending = guestCart || [];
    if (!pending.length) return refresh();

    for (const item of pending) {
      try {
        await cartService.addToCart({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
          variant: item.variant,
        });
      } catch {
        // Item unavailable — skip it rather than blocking the merge
      }
    }
    dispatch(clearGuestCart());
    return refresh();
  }, [guestCart, dispatch, refresh]);

  return {
    items: cartItems,
    activeItems,
    savedItems,
    count,
    subtotal,
    coupon,
    loading,
    isEmpty: activeItems.length === 0,
    addItem,
    updateQuantity,
    removeItem,
    toggleSaveForLater,
    emptyCart,
    applyCoupon,
    removeCoupon,
    refresh,
    mergeGuestCart,
  };
};

export default useCart;
