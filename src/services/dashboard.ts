import api from './api';

export interface DashboardStats {
  total_villas: number;
  active_villas: number;
  maintenance_villas: number;
  today_check_ins: number;
  today_check_outs: number;
  currently_booked: number;
  upcoming_bookings_7_days: number;
  total_bookings_this_month: number;
  revenue_this_month: string;
}

export interface TodayActivity {
  check_ins: Array<{
    id: number;
    villa: {
      id: number;
      name: string;
    };
    client_name: string;
    client_phone: string;
    number_of_guests?: number;
  }>;
  check_outs: Array<{
    id: number;
    villa: {
      id: number;
      name: string;
    };
    client_name: string;
    client_phone: string;
    number_of_guests?: number;
  }>;
}

export const dashboardService = {
  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await api.get<DashboardStats>('/bookings/dashboard/stats/', { params });
    return response.data;
  },

  async getTodayActivity(): Promise<TodayActivity> {
    const response = await api.get<TodayActivity>('/bookings/dashboard/today-activity/');
    return response.data;
  },
};
