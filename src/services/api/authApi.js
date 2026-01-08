import { apiSlice } from './apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        // Store tokens in localStorage after successful login
        if (response.access) {
          localStorage.setItem('access_token', response.access)
        }
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh)
        }
        if (response.user) {
          localStorage.setItem('villa_admin_auth', JSON.stringify(response.user))
        }
        return response
      },
    }),
    
    getMe: builder.query({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),
    
    logout: builder.mutation({
      query: () => {
        const refreshToken = localStorage.getItem('refresh_token')
        return {
          url: '/auth/logout/',
          method: 'POST',
          body: refreshToken ? { refresh: refreshToken } : {},
        }
      },
      invalidatesTags: ['User'],
      transformResponse: (response) => {
        // Clear tokens from localStorage after logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('villa_admin_auth')
        return response
      },
    }),
    
    validateToken: builder.mutation({
      query: (token) => ({
        url: '/auth/token/validate/',
        method: 'POST',
        body: { token },
      }),
    }),
    
    getTokenInfo: builder.query({
      query: () => ({
        url: '/auth/token/validate/',
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useValidateTokenMutation,
  useGetTokenInfoQuery,
  useLazyGetTokenInfoQuery,
} = authApi
