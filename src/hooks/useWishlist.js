import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/apiServices';
import { setWishlist, toggleWishlistItem } from '../redux/slices/wishlistSlice';
import { errorMessage } from '../utils/format';

/**
 * useWishlist — server-backed favourites for signed-in shoppers.
 *
 * The wishlist deliberately requires an account (unlike the cart): it is tied
 * to the user record, and silently losing a guest wishlist on sign-out would
 * be worse than asking for a login up front.
 */
export const useWishlist = ({ autoLoad = false } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.wishlist);

  const load = useCallback(async () => {
    if (!isAuthenticated) return [];
    try {
      const { data } = await userService.getWishlist();
      const products = data.data?.wishlist || [];
      dispatch(setWishlist(products.map((p) => p._id || p)));
      return products;
    } catch {
      return [];
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (autoLoad && isAuthenticated && items.length === 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, isAuthenticated]);

  const isWishlisted = useCallback(
    (productId) => items.includes(productId),
    [items],
  );

  const toggle = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast('Sign in to save favourites', { icon: '❤️' });
      navigate('/login', { state: { from: window.location.pathname } });
      return false;
    }

    const productId = product._id || product;
    const wasWishlisted = items.includes(productId);

    // Optimistic — the heart should fill the instant it's tapped
    dispatch(toggleWishlistItem(productId));

    try {
      await userService.toggleWishlist(productId);
      toast.success(wasWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
      return !wasWishlisted;
    } catch (err) {
      dispatch(toggleWishlistItem(productId)); // roll back
      toast.error(errorMessage(err));
      return wasWishlisted;
    }
  }, [isAuthenticated, items, dispatch, navigate]);

  return { wishlist: items, count: items.length, isWishlisted, toggle, load };
};

export default useWishlist;
