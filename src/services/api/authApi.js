import { apiSlice } from './apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    getMe: builder.query({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApi
