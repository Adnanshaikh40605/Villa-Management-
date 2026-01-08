import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://villa-backend-management-production.up.railway.app/api/v1'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Get token from localStorage (consistent with api.ts)
    const token = localStorage.getItem('access_token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  // If 401 error and we haven't tried refreshing yet
  if (result?.error?.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        })
        
        if (refreshResult.ok) {
          const data = await refreshResult.json()
          // Store new access token
          localStorage.setItem('access_token', data.access)
          
          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions)
        } else {
          // Refresh failed - clear tokens and logout
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('villa_admin_auth')
          // Dispatch logout action if available
          if (api.dispatch) {
            api.dispatch({ type: 'auth/logout' })
          }
          // Redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } catch (refreshError) {
        // Refresh request failed - clear tokens and logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('villa_admin_auth')
        if (api.dispatch) {
          api.dispatch({ type: 'auth/logout' })
        }
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    } else {
      // No refresh token available - logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('villa_admin_auth')
      if (api.dispatch) {
        api.dispatch({ type: 'auth/logout' })
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }
  
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Villas', 'Bookings', 'Analytics', 'User'],
  endpoints: (builder) => ({}),
})
