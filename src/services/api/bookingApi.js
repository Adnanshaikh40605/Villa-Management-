import { apiSlice } from './apiSlice'

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.villa) searchParams.append('villa', params.villa)
        if (params.status) searchParams.append('status', params.status)
        if (params.search) searchParams.append('search', params.search)
        if (params.check_in_after) searchParams.append('check_in_after', params.check_in_after)
        if (params.check_in_before) searchParams.append('check_in_before', params.check_in_before)
        
        // Pagination & Time Frame
        if (params.page) searchParams.append('page', params.page)
        if (params.page_size) searchParams.append('page_size', params.page_size) // If custom size needed
        if (params.time_frame) searchParams.append('time_frame', params.time_frame) // 'current' or 'completed'
        
        return `/bookings/?${searchParams.toString()}`
      },
      providesTags: ['Bookings'],
    }),
    
    getBookingById: builder.query({
      query: (id) => `/bookings/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Bookings', id }],
    }),
    
    createBooking: builder.mutation({
      query: (booking) => ({
        url: '/bookings/',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Bookings', 'Analytics'],
    }),
    
    updateBooking: builder.mutation({
      query: ({ id, ...booking }) => ({
        url: `/bookings/${id}/`,
        method: 'PUT',
        body: booking,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bookings', id },
        'Bookings',
        'Analytics',
      ],
    }),
    
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings', 'Analytics'],
    }),
    
    getCalendarBookings: builder.query({
      query: ({ start, end, villa }) => {
        const params = new URLSearchParams({ start, end })
        if (villa) params.append('villa', villa)
        return `/bookings/calendar/?${params.toString()}`
      },
      providesTags: ['Bookings'],
    }),
    
    getDashboardOverview: builder.query({
      query: (date) => {
        const params = date ? `?date=${date}` : ''
        return `/bookings/dashboard-overview/${params}`
      },
      providesTags: ['Analytics'],
    }),
    
    getRecentBookings: builder.query({
      query: (limit = 10) => `/bookings/recent-bookings/?limit=${limit}`,
      providesTags: ['Bookings'],
    }),
    
    getRevenueChart: builder.query({
      query: (months = 6) => `/bookings/revenue-chart/?months=${months}`,
      providesTags: ['Analytics'],
    }),
    
    getVillaPerformance: builder.query({
      query: () => '/bookings/villa-performance/',
      providesTags: ['Analytics'],
    }),
    
    getBookingSources: builder.query({
      query: () => '/bookings/booking-sources/',
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetCalendarBookingsQuery,
  useGetDashboardOverviewQuery,
  useGetRecentBookingsQuery,
  useGetRevenueChartQuery,
  useGetVillaPerformanceQuery,
  useGetBookingSourcesQuery,
} = bookingApi
