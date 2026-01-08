import { createSlice } from '@reduxjs/toolkit'

// Use consistent token storage keys (access_token/refresh_token)
const initialState = {
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      // Store tokens with consistent keys
      if (token) {
        localStorage.setItem('access_token', token)
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }
      // Also update user data if provided
      if (user) {
        localStorage.setItem('villa_admin_auth', JSON.stringify(user))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      // Clear all auth-related localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('villa_admin_auth')
      // Also clear old 'token' key for backwards compatibility
      localStorage.removeItem('token')
    },
    updateToken: (state, action) => {
      const { token } = action.payload
      if (token) {
        state.token = token
        localStorage.setItem('access_token', token)
      }
    },
  },
})

export const { setCredentials, logout, updateToken } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
