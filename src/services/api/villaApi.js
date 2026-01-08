import { apiSlice } from './apiSlice'

export const villaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVillas: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.status) searchParams.append('status', params.status)
        return `/villas/?${searchParams.toString()}`
      },
      providesTags: ['Villas'],
    }),
    
    getVillaById: builder.query({
      query: (id) => `/villas/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Villas', id }],
    }),
    
    createVilla: builder.mutation({
      query: (villa) => ({
        url: '/villas/',
        method: 'POST',
        body: villa,
      }),
      invalidatesTags: ['Villas'],
    }),
    
    updateVilla: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `villas/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Villas'],
    }),
    
    deleteVilla: builder.mutation({
      query: (id) => ({
        url: `villas/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Villas'],
    }),
    
    createGlobalSpecialDay: builder.mutation({
        query: (body) => ({
            url: 'special-days/',
            method: 'POST',
            body
        }),
    }),
    
    checkAvailability: builder.query({
      query: ({ id, check_in, check_out }) => 
        `/villas/${id}/availability/?check_in=${check_in}&check_out=${check_out}`,
    }),
  }),
})

export const {
  useGetVillasQuery,
  useGetVillaByIdQuery,
  useCreateVillaMutation,
  useUpdateVillaMutation,
  useDeleteVillaMutation,
  useCreateGlobalSpecialDayMutation,
  useCheckAvailabilityQuery,
  useLazyCheckAvailabilityQuery,
} = villaApi
