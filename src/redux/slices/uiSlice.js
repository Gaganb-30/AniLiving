import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchOpen: false,
  mobileMenuOpen: false,
  cartDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    setSearchOpen: (state, action) => { state.searchOpen = action.payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload; },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen; },
    setCartDrawerOpen: (state, action) => { state.cartDrawerOpen = action.payload; },
  },
});

export const {
  toggleSearch, setSearchOpen,
  toggleMobileMenu, setMobileMenuOpen,
  toggleCartDrawer, setCartDrawerOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
