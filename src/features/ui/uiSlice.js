import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  mobileMenuOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer

export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen
export const selectTheme = (state) => state.ui.theme
