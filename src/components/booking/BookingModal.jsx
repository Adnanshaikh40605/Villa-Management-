import { useState } from 'react'
import { useCreateBookingMutation } from '@/services/api/bookingApi'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function BookingModal({ isOpen, onClose, selectedDates, villas }) {
  const [formData, setFormData] = useState({
    villa: '',
    client_name: '',
    client_phone: '',
    guests: 1,
    status: 'booked',
    payment_status: 'pending',
  })

  const [createBooking, { isLoading }] = useCreateBookingMutation()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDates) {
      toast.error('Please select dates')
      return
    }

    try {
      const bookingData = {
        villa: formData.villa,
        guests: parseInt(formData.guests),
        check_in: format(selectedDates.start, 'yyyy-MM-dd'),
        check_out: format(selectedDates.end, 'yyyy-MM-dd'),
        status: formData.status,
        payment_status: formData.payment_status,
      }

      // Only include client details if status is 'booked'
      if (formData.status === 'booked') {
        bookingData.client_name = formData.client_name
        bookingData.client_phone = formData.client_phone
      }

      await createBooking(bookingData).unwrap()

      toast.success('Booking created successfully!')
      onClose()
      // Reset form
      setFormData({
        villa: '',
        client_name: '',
        client_phone: '',
        guests: 1,
        status: 'booked',
        payment_status: 'pending',
      })
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error?.data?.detail || 'Failed to create booking')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Booking" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Display */}
        {selectedDates && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm font-medium text-primary-900">
              Selected Dates: {format(selectedDates.start, 'MMM dd, yyyy')} - {format(selectedDates.end, 'MMM dd, yyyy')}
            </p>
          </div>
        )}

        {/* Villa Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Villa <span className="text-red-500">*</span>
          </label>
          <select
            name="villa"
            value={formData.villa}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select a villa</option>
            {villas.map((villa) => (
              <option key={villa.id} value={villa.id}>
                {villa.name} - {villa.location}
              </option>
            ))}
          </select>
        </div>

        {/* Booking Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Booking Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="booked"
                checked={formData.status === 'booked'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Booked</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="blocked"
                checked={formData.status === 'blocked'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Blocked</span>
            </label>
          </div>
        </div>

        {/* Client Details - Only show if booked */}
        {formData.status === 'booked' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required={formData.status === 'booked'}
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  required={formData.status === 'booked'}
                  className="input"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg font-semibold">−</span>
                  </button>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    className="input text-center flex-1"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg font-semibold">+</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="advance">Advance Paid</option>
                  <option value="full">Full Payment</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
          >
            Create Booking
          </Button>
        </div>
      </form>
    </Modal>
  )
}
