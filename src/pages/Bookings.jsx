import { useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useGetBookingsQuery, useDeleteBookingMutation, useUpdateBookingMutation } from '@/services/api/bookingApi'
import { useGetVillasQuery } from '@/services/api/villaApi'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import BookingDetailsModal from '@/components/booking/BookingDetailsModal'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Bookings() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useGetBookingsQuery({ search, status: statusFilter })
  const { data: villasData } = useGetVillasQuery({})
  const [deleteBooking] = useDeleteBookingMutation()
  const [updateBooking] = useUpdateBookingMutation()

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const bookings = data?.results || data || []
  const villas = villasData?.results || villasData || []

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id).unwrap()
        toast.success('Booking deleted successfully')
        setIsModalOpen(false)
      } catch (error) {
        toast.error('Failed to delete booking')
      }
    }
  }

  const handleUpdate = async (id, data) => {
      try {
          await updateBooking({ id, ...data }).unwrap()
          toast.success('Booking updated successfully')
          setIsModalOpen(false)
          setSelectedBooking(null)
      } catch (error) {
          console.error('Update failed', error)
          toast.error('Failed to update booking')
      }
  }

  const handleEdit = (booking) => {
      setSelectedBooking({
          id: booking.id,
          // Handle cases where villa is object or ID (though table shows name, so assumes object available or we map it)
          villa: booking.villa?.name || booking.villa_name || 'N/A', 
          villa_id: booking.villa?.id || booking.villa,
          client: booking.client_name,
          phone: booking.client_phone,
          guests: booking.number_of_guests,
          notes: booking.notes,
          status: booking.status,
          checkIn: booking.check_in, // String or Date
          checkOut: booking.check_out
      })
      setIsModalOpen(true)
  }

  const getPaymentBadgeVariant = (status) => {
    switch (status) {
      case 'full':
        return 'success'
      case 'advance':
        return 'warning'
      case 'pending':
        return 'danger'
      default:
        return 'info'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-gray-600">Manage all villa bookings</p>
        </div>
        <Button variant="primary" icon={PlusIcon}>
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name or phone..."
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Bookings</option>
              <option value="booked">Booked</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Villa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {booking.villa?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.client_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.client_phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(booking.check_in), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={booking.status === 'booked' ? 'success' : 'info'}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {booking.payment_status && (
                        <Badge variant={getPaymentBadgeVariant(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{booking.total_payment || '0'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      ₹{booking.advance_payment || '0'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">
                      ₹{booking.pending_payment || '0'}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                       <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(booking)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <BookingDetailsModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         booking={selectedBooking}
         onUpdate={handleUpdate}
         onDelete={handleDelete}
         villas={villas}
      />
    </div>
  )
}
