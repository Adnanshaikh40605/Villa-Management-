import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Search, Edit, Trash2, Phone, Calendar } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';

export default function Bookings() {
  const { villas, bookings, deleteBooking, getVillaById } = useData();
  

  const [searchQuery, setSearchQuery] = useState('');
  const [villaFilter, setVillaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Villa filter
      if (villaFilter !== 'all' && booking.villaId !== parseInt(villaFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = booking.clientName.toLowerCase().includes(query);
        const matchesPhone = booking.clientPhone.includes(query);
        if (!matchesName && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, villaFilter, statusFilter, searchQuery]);

  // Sort by check-in date (newest first)
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort(
      (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
    );
  }, [filteredBookings]);

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingForm(true);
  };

  const handleDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete.id);
      toast({ title: 'Booking Deleted', description: 'The booking has been removed.' });
      setBookingToDelete(null);
    }
  };

  const handleAddBooking = () => {
    setSelectedBooking(undefined);
    setShowBookingForm(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Button onClick={handleAddBooking}>
          <Plus className="h-4 w-4 mr-1" />
          Add Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={villaFilter} onValueChange={setVillaFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Villas" />
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Villa</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedBookings.map((booking) => {
                    const villa = getVillaById(booking.villaId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{villa?.name}</TableCell>
                        <TableCell>{booking.clientName}</TableCell>
                        <TableCell>{booking.clientPhone || '-'}</TableCell>
                        <TableCell>{formatDate(booking.checkIn)}</TableCell>
                        <TableCell>{formatDate(booking.checkOut)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={booking.status === 'booked' ? 'default' : 'secondary'}
                            className={
                              booking.status === 'blocked'
                                ? 'bg-blocked text-primary-foreground'
                                : 'bg-booked text-primary-foreground'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(booking)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setBookingToDelete(booking)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedBookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No bookings found
            </CardContent>
          </Card>
        ) : (
          sortedBookings.map((booking) => {
            const villa = getVillaById(booking.villaId);
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{booking.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{villa?.name}</p>
                    </div>
                    <Badge
                      variant={booking.status === 'booked' ? 'default' : 'secondary'}
                      className={
                        booking.status === 'blocked'
                          ? 'bg-blocked text-primary-foreground'
                          : 'bg-booked text-primary-foreground'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {booking.clientPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {booking.clientPhone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(booking)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookingToDelete(booking)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Booking Form Dialog */}
      <BookingForm
        open={showBookingForm}
        onOpenChange={(open) => {
          setShowBookingForm(open);
          if (!open) setSelectedBooking(undefined);
        }}
        booking={selectedBooking}
      />

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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
