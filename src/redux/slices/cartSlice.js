import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  guestCart: [],   // For non-logged-in users
  coupon: null,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.coupon = action.payload.coupon || null;
    },
    addToGuestCart: (state, action) => {
      const { productId, product, quantity, variant, variantId, price } = action.payload;
      const existingIndex = state.guestCart.findIndex(
        (item) => item.productId === productId && item.variantId === variantId
      );
      if (existingIndex > -1) {
        state.guestCart[existingIndex].quantity += quantity;
      } else {
        state.guestCart.push({ productId, product, quantity, variant, variantId, price });
      }
    },
    updateGuestCartItem: (state, action) => {
      const { index, quantity } = action.payload;
      if (state.guestCart[index]) {
        state.guestCart[index].quantity = quantity;
      }
    },
    removeFromGuestCart: (state, action) => {
      state.guestCart.splice(action.payload, 1);
    },
    clearGuestCart: (state) => {
      state.guestCart = [];
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCart, addToGuestCart, updateGuestCartItem,
  removeFromGuestCart, clearGuestCart, clearCart, setCartLoading,
} = cartSlice.actions;
export default cartSlice.reducer;
