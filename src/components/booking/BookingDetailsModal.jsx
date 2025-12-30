import Modal from '@/components/common/Modal'
import Badge from '@/components/common/Badge'
import { format } from 'date-fns'

export default function BookingDetailsModal({ isOpen, onClose, booking }) {
  if (!booking) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="md">
      <div className="space-y-4">
        {/* Villa Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Villa</label>
          <p className="text-base text-gray-900">{booking.villa}</p>
        </div>

        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <p className="text-base text-gray-900">{booking.client}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <p className="text-base text-gray-900">
              {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <p className="text-base text-gray-900">
              {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Badge variant={booking.status === 'booked' ? 'success' : 'info'}>
            {booking.status}
          </Badge>
        </div>
      </div>
    </Modal>
  )
}
