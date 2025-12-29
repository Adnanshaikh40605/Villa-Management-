import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentStatus, BookingSource } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parse } from 'date-fns';

interface BookingFormProps {
  booking?: Booking;
  villaId?: number;
  checkIn?: string;
  checkOut?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BookingForm({
  booking,
  villaId,
  checkIn,
  checkOut,
  open,
  onOpenChange,
  onSuccess,
}: BookingFormProps) {
  const { villas, addBooking, updateBooking, checkAvailability } = useData();

  const [formData, setFormData] = useState({
    villaId: booking?.villaId || villaId || villas[0]?.id || 1,
    clientName: booking?.clientName || '',
    clientPhone: booking?.clientPhone || '',
    checkIn: booking?.checkIn || checkIn || '',
    checkOut: booking?.checkOut || checkOut || '',
    status: booking?.status || 'booked' as BookingStatus,
    numberOfGuests: booking?.numberOfGuests || undefined as number | undefined,
    notes: booking?.notes || '',
    paymentStatus: booking?.paymentStatus || undefined as PaymentStatus | undefined,
    bookingSource: booking?.bookingSource || undefined as BookingSource | undefined,
  });

  const isEditing = !!booking;

  const resetForm = () => {
    setFormData({
      villaId: villaId || villas[0]?.id || 1,
      clientName: '',
      clientPhone: '',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      status: 'booked',
      numberOfGuests: undefined,
      notes: '',
      paymentStatus: undefined,
      bookingSource: undefined,
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    // Phone validation: optional but max 10 digits if provided
    if (formData.clientPhone && formData.clientPhone.replace(/\D/g, '').length > 10) {
      toast.error('Phone number must be 10 digits or less');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Check-in and check-out dates are required');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('Check-out must be after check-in');
      return;
    }

    // Check availability
    const isAvailable = await checkAvailability(
      formData.villaId,
      formData.checkIn,
      formData.checkOut,
      booking?.id
    );

    if (!isAvailable) {
      toast.error('The selected dates overlap with an existing booking');
      return;
    }

    try {
      if (isEditing && booking) {
        await updateBooking(booking.id, formData);
        toast.success('Booking updated successfully');
      } else {
        const result = await addBooking(formData);
        if (result) {
          toast.success('Booking created successfully');
          resetForm();
        } else {
          return; // Error already shown by addBooking
        }
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error already handled by context
      console.error('Booking form error:', error);
    }
  };

  // Reset form when opening with new props
  React.useEffect(() => {
    if (open) {
      if (booking) {
        setFormData({
          villaId: booking.villaId,
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status,
          numberOfGuests: booking.numberOfGuests,
          notes: booking.notes || '',
          paymentStatus: booking.paymentStatus,
          bookingSource: booking.bookingSource,
        });
      } else {
        setFormData({
          villaId: villaId || villas[0]?.id || 1,
          clientName: '',
          clientPhone: '',
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          status: 'booked',
          numberOfGuests: undefined,
          notes: '',
          paymentStatus: undefined,
          bookingSource: undefined,
        });
      }
    }
  }, [open, booking, villaId, checkIn, checkOut, villas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update booking details' : 'Create a new booking or block dates'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="villa">Villa *</Label>
            <Select
              value={String(formData.villaId)}
              onValueChange={(value) => setFormData({ ...formData, villaId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={String(villa.id)}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as BookingStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder={formData.status === 'blocked' ? 'e.g., Owner Block' : 'Enter client name'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone Number (optional)</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length <= 10) {
                  setFormData({ ...formData, clientPhone: value });
                }
              }}
              placeholder="Enter phone number (max 10 digits)"
              maxLength={10}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <DatePicker
                date={formData.checkIn ? parse(formData.checkIn, 'yyyy-MM-dd', new Date()) : undefined}
                onSelect={(date) => setFormData({ ...formData, checkIn: date ? format(date, 'yyyy-MM-dd') : '' })}
                placeholder="Select check-in date"
                minDate={new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label>Check-out *</Label>
              <DatePicker
                date={formData.checkOut ? parse(formData.checkOut, 'yyyy-MM-dd', new Date()) : undefined}
                onSelect={(date) => setFormData({ ...formData, checkOut: date ? format(date, 'yyyy-MM-dd') : '' })}
                placeholder="Select check-out date"
                minDate={formData.checkIn ? parse(formData.checkIn, 'yyyy-MM-dd', new Date()) : new Date()}
              />
            </div>
          </div>

          {formData.status === 'booked' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">Number of Guests</Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min={1}
                  value={formData.numberOfGuests || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfGuests: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={formData.paymentStatus || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        paymentStatus: value ? (value as PaymentStatus) : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingSource">Booking Source</Label>
                  <Select
                    value={formData.bookingSource || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        bookingSource: value ? (value as BookingSource) : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update' : 'Create'} Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
