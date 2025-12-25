import api from './api';

export interface Villa {
  id: number;
  name: string;
  location: string;
  max_guests: number;
  price_per_night: string;
  status: 'active' | 'maintenance';
  image?: string;
  description?: string;
  amenities?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflicting_bookings: Array<{
    id: number;
    client_name: string;
    check_in: string;
    check_out: string;
  }>;
}

export const villasService = {
  async getVillas(filters?: { status?: string }): Promise<Villa[]> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const response = await api.get<{ count: number; results: Villa[] }>('/villas/', { params });
    // Extract results array from paginated response
    return response.data.results || response.data as any;
  },

  async getVilla(id: number): Promise<Villa> {
    const response = await api.get<Villa>(`/villas/${id}/`);
    return response.data;
  },

  async createVilla(data: Omit<Villa, 'id' | 'created_at' | 'updated_at'>): Promise<Villa> {
    const response = await api.post<Villa>('/villas/', data);
    return response.data;
  },

  async updateVilla(id: number, data: Partial<Villa>): Promise<Villa> {
    const response = await api.patch<Villa>(`/villas/${id}/`, data);
    return response.data;
  },

  async checkAvailability(
    id: number,
    checkIn: string,
    checkOut: string
  ): Promise<AvailabilityResponse> {
    const response = await api.get<AvailabilityResponse>(
      `/villas/${id}/availability/`,
      {
        params: { check_in: checkIn, check_out: checkOut },
      }
    );
    return response.data;
  },
};
