import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Villa, Booking } from '@/types';
import { villasService, Villa as ApiVilla } from '@/services/villas';
import { bookingsService, Booking as ApiBooking } from '@/services/bookings';
import { handleApiError } from '@/services/api';
import { toast } from '@/lib/toast';
import { useAuth } from './AuthContext';

interface DataContextType {
  villas: Villa[];
  bookings: Booking[];
  isLoading: boolean;
  addVilla: (villa: Omit<Villa, 'id'>) => Promise<Villa | null>;
  updateVilla: (id: number, updates: Partial<Villa>) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking | null>;
  updateBooking: (id: number, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  getVillaById: (id: number) => Villa | undefined;
  getBookingsForVilla: (villaId: number) => Booking[];
  checkAvailability: (villaId: number, checkIn: string, checkOut: string, excludeBookingId?: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Convert API villa to frontend villa type
const convertApiVilla = (apiVilla: ApiVilla): Villa => ({
  id: apiVilla.id,
  name: apiVilla.name,
  location: apiVilla.location,
  maxGuests: apiVilla.max_guests,
  pricePerNight: parseFloat(apiVilla.price_per_night),
  status: apiVilla.status,
  image: apiVilla.image,
});

// Convert API booking to frontend booking type
const convertApiBooking = (apiBooking: ApiBooking): Booking => ({
  id: apiBooking.id,
  villaId: apiBooking.villa,
  clientName: apiBooking.client_name,
  clientPhone: apiBooking.client_phone,
  checkIn: apiBooking.check_in,
  checkOut: apiBooking.check_out,
  status: apiBooking.status,
  numberOfGuests: apiBooking.number_of_guests,
  notes: apiBooking.notes,
  paymentStatus: apiBooking.payment_status,
  bookingSource: apiBooking.booking_source,
  createdAt: apiBooking.created_at || new Date().toISOString(),
  updatedAt: apiBooking.updated_at || new Date().toISOString(),
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVillas = async () => {
    try {
      const apiVillas = await villasService.getVillas();
      setVillas(apiVillas.map(convertApiVilla));
    } catch (error) {
      console.error('Error fetching villas:', handleApiError(error));
      toast.error('Failed to load villas');
    }
  };

  const fetchBookings = async () => {
    try {
      const apiBookings = await bookingsService.getBookings();
      setBookings(apiBookings.map(convertApiBooking));
    } catch (error) {
      console.error('Error fetching bookings:', handleApiError(error));
      toast.error('Failed to load bookings');
    }
  };


  const refreshData = async () => {
    // Only fetch if we have an access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    await Promise.all([fetchVillas(), fetchBookings()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated]);

  const addVilla = async (villaData: Omit<Villa, 'id'>): Promise<Villa | null> => {
    try {
      const apiVillaData = {
        name: villaData.name,
        location: villaData.location,
        max_guests: villaData.maxGuests,
        price_per_night: String(villaData.pricePerNight),
        status: villaData.status,
        description: villaData.description,
        amenities: villaData.amenities,
      };

      const created = await villasService.createVilla(apiVillaData);
      const newVilla = convertApiVilla(created);
      setVillas(prev => [...prev, newVilla]);
      return newVilla;
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVilla = async (id: number, updates: Partial<Villa>) => {
    try {
      const apiUpdates: Partial<ApiVilla> = {};
      if (updates.location) apiUpdates.location = updates.location;
      if (updates.maxGuests) apiUpdates.max_guests = updates.maxGuests;
      if (updates.pricePerNight) apiUpdates.price_per_night = String(updates.pricePerNight);
      if (updates.status) apiUpdates.status = updates.status;

      const updated = await villasService.updateVilla(id, apiUpdates);
      setVillas(prev =>
        prev.map(villa =>
          villa.id === id ? convertApiVilla(updated) : villa
        )
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking | null> => {
    try {
      const apiBookingData = {
        villa: bookingData.villaId,
        client_name: bookingData.clientName,
        client_phone: bookingData.clientPhone,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        status: bookingData.status,
        number_of_guests: bookingData.numberOfGuests,
        notes: bookingData.notes,
        payment_status: bookingData.paymentStatus,
        booking_source: bookingData.bookingSource,
      };

      const created = await bookingsService.createBooking(apiBookingData);
      const newBooking = convertApiBooking(created);
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateBooking = async (id: number, updates: Partial<Booking>) => {
    try {
      const apiUpdates: Partial<ApiBooking> = {};
      if (updates.villaId) apiUpdates.villa = updates.villaId;
      if (updates.clientName) apiUpdates.client_name = updates.clientName;
      if (updates.clientPhone) apiUpdates.client_phone = updates.clientPhone;
      if (updates.checkIn) apiUpdates.check_in = updates.checkIn;
      if (updates.checkOut) apiUpdates.check_out = updates.checkOut;
      if (updates.status) apiUpdates.status = updates.status;
      if (updates.numberOfGuests !== undefined) apiUpdates.number_of_guests = updates.numberOfGuests;
      if (updates.notes !== undefined) apiUpdates.notes = updates.notes;
      if (updates.paymentStatus) apiUpdates.payment_status = updates.paymentStatus;
      if (updates.bookingSource) apiUpdates.booking_source = updates.bookingSource;

      const updated = await bookingsService.updateBooking(id, apiUpdates);
      setBookings(prev =>
        prev.map(booking =>
          booking.id === id ? convertApiBooking(updated) : booking
        )
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      await bookingsService.deleteBooking(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getVillaById = (id: number) => {
    return villas.find(villa => villa.id === id);
  };

  const getBookingsForVilla = (villaId: number) => {
    return bookings.filter(booking => booking.villaId === villaId);
  };

  const checkAvailability = async (
    villaId: number,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: number
  ): Promise<boolean> => {
    try {
      const result = await villasService.checkAvailability(villaId, checkIn, checkOut);
      
      // If there are conflicting bookings, check if they should be excluded
      if (!result.available && excludeBookingId) {
        const relevantConflicts = result.conflicting_bookings.filter(
          booking => booking.id !== excludeBookingId
        );
        return relevantConflicts.length === 0;
      }
      
      return result.available;
    } catch (error) {
      console.error('Error checking availability:', handleApiError(error));
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        villas,
        bookings,
        isLoading,
        addVilla,
        updateVilla,
        addBooking,
        updateBooking,
        deleteBooking,
        getVillaById,
        getBookingsForVilla,
        checkAvailability,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
