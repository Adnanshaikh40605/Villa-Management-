export type VillaStatus = 'active' | 'maintenance';

export type BookingStatus = 'booked' | 'blocked';

export type PaymentStatus = 'pending' | 'advance' | 'full';

export type BookingSource = 'call' | 'whatsapp' | 'website' | 'other';

export interface Villa {
  id: number;
  name: string;
  location: string;
  maxGuests: number;
  pricePerNight: number;
  status: VillaStatus;
  image?: string;
}

export interface Booking {
  id: number;
  villaId: number;
  clientName: string;
  clientPhone: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: BookingStatus;
  numberOfGuests?: number;
  notes?: string;
  paymentStatus?: PaymentStatus;
  bookingSource?: BookingSource;
  totalPayment?: number;
  advancePayment?: number;
  pendingPayment?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
