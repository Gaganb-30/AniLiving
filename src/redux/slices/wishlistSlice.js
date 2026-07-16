import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    toggleWishlistItem: (state, action) => {
      const productId = action.payload;
      const index = state.items.findIndex((id) => id === productId);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(productId);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setWishlist, toggleWishlistItem, clearWishlist, setWishlistLoading } = wishlistSlice.actions;
export default wishlistSlice.reducer;
