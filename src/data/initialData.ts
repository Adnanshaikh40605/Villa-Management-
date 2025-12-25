import { Villa, Booking } from '@/types';

export const INITIAL_VILLAS: Villa[] = [
  {
    id: 1,
    name: 'SOLE VILLA',
    location: 'Beachfront, East Wing',
    maxGuests: 10,
    pricePerNight: 12000,
    status: 'active',
  },
  {
    id: 2,
    name: 'SEQUEL VILLA',
    location: 'Garden View, West Wing',
    maxGuests: 8,
    pricePerNight: 10000,
    status: 'active',
  },
  {
    id: 3,
    name: 'BITWIXT VILLA',
    location: 'Poolside, Central',
    maxGuests: 6,
    pricePerNight: 8000,
    status: 'active',
  },
  {
    id: 4,
    name: 'FOUNTAIN VILLA',
    location: 'Hilltop, North Wing',
    maxGuests: 12,
    pricePerNight: 15000,
    status: 'active',
  },
];

// Sample bookings for demo
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 1,
    villaId: 1,
    clientName: 'Amit Verma',
    clientPhone: '9876543210',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)),
    status: 'booked',
    numberOfGuests: 4,
    notes: 'Pool side request',
    paymentStatus: 'advance',
    bookingSource: 'whatsapp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    villaId: 2,
    clientName: 'Priya Sharma',
    clientPhone: '9876543211',
    checkIn: formatDate(today),
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    status: 'booked',
    numberOfGuests: 6,
    paymentStatus: 'full',
    bookingSource: 'call',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    villaId: 3,
    clientName: 'Owner Block',
    clientPhone: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
    status: 'blocked',
    notes: 'Owner personal use',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    villaId: 4,
    clientName: 'Rahul Singh',
    clientPhone: '9876543212',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
    checkOut: formatDate(today),
    status: 'booked',
    numberOfGuests: 8,
    paymentStatus: 'full',
    bookingSource: 'website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
