import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/auth'

// Use consistent token storage keys (access_token/refresh_token)
const initialState = {
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
}

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { dispatch, rejectWithValue }) => {
  try {
    const user = await authService.getCurrentUser()
    return user
  } catch (error) {
    // Return both the data and the status code for better error handling in the reducer
    const status = error.response ? error.response.status : 0
    return rejectWithValue({ data: error.response?.data, status })
  }
})

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
      state.status = 'idle'
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
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = 'failed'
        state.user = null
        
        // Only logout if it is an authentication error (401)
        // If it's a network error or server error (500), keep the session for now
        // to prevent annoying logouts during temporary glitches
        if (action.payload && action.payload.status === 401) {
          state.token = null
          state.isAuthenticated = false
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('villa_admin_auth')
          localStorage.removeItem('token')
        }
      })
  },
})

export const { setCredentials, logout, updateToken } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
export const selectAuthStatus = (state) => state.auth.status
