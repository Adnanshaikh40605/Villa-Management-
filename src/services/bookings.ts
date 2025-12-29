import api from './api';

export interface Booking {
  id: number;
  villa: number;
  villa_details?: {
    id: number;
    name: string;
    location: string;
    max_guests: number;
    price_per_night: string;
    status: string;
    image?: string;
  };
  client_name: string;
  client_phone: string;
  client_email?: string;
  check_in: string;
  check_out: string;
  status: 'booked' | 'blocked';
  number_of_guests?: number;
  notes?: string;
  payment_status?: 'pending' | 'advance' | 'full';
  booking_source?: 'call' | 'whatsapp' | 'website' | 'other';
  total_amount?: string;
  nights?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BookingFilters {
  villa?: number;
  status?: string;
  check_in_after?: string;
  check_in_before?: string;
  search?: string;
}

export interface CalendarBooking {
  id: number;
  villa_id: number;
  villa_name: string;
  client_name: string;
  check_in: string;
  check_out: string;
  status: string;
}

export const bookingsService = {
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.villa) params.append('villa', String(filters.villa));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.check_in_after) params.append('check_in_after', filters.check_in_after);
    if (filters?.check_in_before) params.append('check_in_before', filters.check_in_before);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{ count: number; results: Booking[] }>('/bookings/', { params });
    // Extract results array from paginated response
    return response.data.results || response.data as any;
  },

  async getBooking(id: number): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}/`);
    return response.data;
  },

  async createBooking(data: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'total_amount' | 'nights' | 'villa_details'>): Promise<Booking> {
    const response = await api.post<Booking>('/bookings/', data);
    return response.data;
  },

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/`, data);
    return response.data;
  },

  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}/`);
  },

  async getCalendarBookings(
    start: string,
    end: string,
    villaId?: number
  ): Promise<CalendarBooking[]> {
    const params = new URLSearchParams();
    params.append('start', start);
    params.append('end', end);
    if (villaId) params.append('villa', String(villaId));

    const response = await api.get<CalendarBooking[]>('/bookings/calendar/', { params });
    return response.data;
  },
};
