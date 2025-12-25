import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { useData } from '@/contexts/DataContext';
import { Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { toast } from '@/lib/toast';

export default function BookingCalendar() {
  const { villas, bookings, deleteBooking, getVillaById } = useData();
  

  const [selectedVillaId, setSelectedVillaId] = useState<number | 'all'>(villas[0]?.id || 1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [newBookingDates, setNewBookingDates] = useState<{ checkIn: string; checkOut: string } | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Filter bookings by selected villa
  const filteredBookings = useMemo(() => {
    if (selectedVillaId === 'all') return bookings;
    return bookings.filter((b) => b.villaId === selectedVillaId);
  }, [bookings, selectedVillaId]);

  // Convert bookings to FullCalendar events
  const calendarEvents = useMemo(() => {
    return filteredBookings.map((booking) => {
      const villa = getVillaById(booking.villaId);
      return {
        id: String(booking.id),
        title: selectedVillaId === 'all'
          ? `${villa?.name}: ${booking.clientName}`
          : booking.clientName,
        start: booking.checkIn,
        end: booking.checkOut,
        className: booking.status === 'blocked' ? 'fc-event-blocked' : 'fc-event-booked',
        extendedProps: { booking },
      };
    });
  }, [filteredBookings, selectedVillaId, getVillaById]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedBooking(undefined);
    setNewBookingDates({
      checkIn: selectInfo.startStr,
      checkOut: selectInfo.endStr,
    });
    setShowBookingForm(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const booking = clickInfo.event.extendedProps.booking as Booking;
    setSelectedBooking(booking);
    setNewBookingDates(null);
    setShowBookingForm(true);
  };

  const handleAddBooking = () => {
    setSelectedBooking(undefined);
    setNewBookingDates(null);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete.id);
      toast({ title: 'Booking Deleted', description: 'The booking has been removed.' });
      setBookingToDelete(null);
      setShowBookingForm(false);
      setSelectedBooking(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Booking Calendar</h1>
          <p className="text-muted-foreground">Manage villa availability and bookings</p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(selectedVillaId)}
            onValueChange={(value) =>
              setSelectedVillaId(value === 'all' ? 'all' : parseInt(value))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villas</SelectItem>
              {villas.map((villa) => (
                <SelectItem key={villa.id} value={String(villa.id)}>
                  {villa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAddBooking}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Booking</span>
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-booked" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blocked" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-available" />
          <span>Available</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek',
            }}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            contentHeight={600}
            dayMaxEvents={3}
            eventDisplay="block"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
          />
        </CardContent>
      </Card>

      {/* Booking Form Dialog */}
      <BookingForm
        open={showBookingForm}
        onOpenChange={(open) => {
          setShowBookingForm(open);
          if (!open) {
            setSelectedBooking(undefined);
            setNewBookingDates(null);
          }
        }}
        booking={selectedBooking}
        villaId={selectedVillaId !== 'all' ? selectedVillaId : undefined}
        checkIn={newBookingDates?.checkIn}
        checkOut={newBookingDates?.checkOut}
      />

      {/* Delete action for selected booking */}
      {selectedBooking && showBookingForm && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="destructive"
            onClick={() => setBookingToDelete(selectedBooking)}
          >
            Delete Booking
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => !open && setBookingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the booking for{' '}
              <strong>{bookingToDelete?.clientName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
