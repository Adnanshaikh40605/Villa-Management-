import { useState, useEffect } from 'react'
import { useGetBookingByIdQuery } from '@/services/api/bookingApi'
import Modal from '@/components/common/Modal'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { format } from 'date-fns'

export default function BookingDetailsModal({ isOpen, onClose, booking: initialBooking, onUpdate, onDelete, villas }) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: bookingDetails, isLoading } = useGetBookingByIdQuery(initialBooking?.id, {
      skip: !initialBooking?.id
  })

  // Use full details if available, otherwise fall back to initial (summary) data
  const booking = bookingDetails || initialBooking

  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    guests: '',
    status: '',
    notes: '',
    villa_id: '',
    check_in: '',
    check_out: ''
  })

  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        client: booking.client_name || booking.client || '', // Handle different naming conventions
        phone: booking.client_phone || booking.phone || '',
        guests: booking.number_of_guests || booking.guests || 1,
        status: booking.status || 'booked',
        notes: booking.notes || '',
        villa_id: booking.villa?.id || booking.villa || booking.villa_id || '', // Handle object or ID
        check_in: booking.check_in || booking.checkIn,
        check_out: booking.check_out || booking.checkOut
      })
      // Only reset editing state if we're opening a fresh modal, not during re-renders
      if (!isEditing) setIsEditing(false) 
    }
  }, [booking, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Validation for Phone Number: only numbers, max 10 digits
    if (name === 'phone') {
        if (!/^\d*$/.test(value)) return
        if (value.length > 10) return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
     if (!formData.villa_id) {
         alert("Villa is required")
         return
     }

     onUpdate(booking.id, {
         client_name: formData.client,
         client_phone: formData.phone,
         number_of_guests: formData.guests,
         status: formData.status,
         notes: formData.notes,
         villa: typeof formData.villa_id === 'object' ? formData.villa_id.id : formData.villa_id,
         check_in: formData.check_in,
         check_out: formData.check_out
     })
  }

  const handleDelete = () => {
      onDelete(booking.id)
  }

  const handleSendWhatsAppConfirmation = () => {
    // Get phone number (remove any non-digit characters and ensure it starts with country code)
    let phoneNumber = formData.phone.replace(/\D/g, '')
    
    // If phone doesn't start with country code, assume India (+91)
    if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber
    }

    // Format dates
    const checkInFormatted = checkInDate && !isNaN(checkInDate.getTime()) 
      ? format(checkInDate, 'dd MMM yyyy') 
      : 'N/A'
    const checkOutFormatted = checkOutDate && !isNaN(checkOutDate.getTime()) 
      ? format(checkOutDate, 'dd MMM yyyy') 
      : 'N/A'

    // Calculate nights
    const nights = checkInDate && checkOutDate 
      ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) 
      : 0

    // Get villa name
    const villaName = booking.villa_name || booking.villa?.name || 'Your Villa'

    // Get total amount (if available)
    const totalAmount = booking.total_amount 
      ? `₹${parseFloat(booking.total_amount).toLocaleString()}` 
      : 'TBD'

    // Compose WhatsApp message
    const message = `🏡 *Booking Confirmation*

Dear ${formData.client},

Your booking has been confirmed! Here are the details:

📍 *Villa:* ${villaName}
📅 *Check-in:* ${checkInFormatted}
📅 *Check-out:* ${checkOutFormatted}
🌙 *Nights:* ${nights}
👥 *Guests:* ${formData.guests}
💰 *Total Amount:* ${totalAmount}

Thank you for choosing us! We look forward to hosting you.

If you have any questions, feel free to reply to this message.

Best regards,
VillaManager Team`

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (!booking && !isLoading) return null

  // Ensure check-in/check-out are valid Date objects for format
  const checkInDate = formData.check_in ? new Date(formData.check_in) : null
  const checkOutDate = formData.check_out ? new Date(formData.check_out) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Booking" : "Booking Details"} size="md">
        {isLoading ? (
            <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
            </div>
        ) : (
      <div className="space-y-4">
        {/* Villa Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Villa</label>
          {isEditing ? (
              <select
                name="villa_id"
                value={typeof formData.villa_id === 'object' ? formData.villa_id.id : formData.villa_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                  <option value="">Select a Villa</option>
                  {villas?.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
              </select>
          ) : (
             <p className="text-base text-gray-900">{booking.villa_name || booking.villa?.name || booking.villa}</p>
          )}
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              {isEditing ? (
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
              ) : (
                  <p className="text-base text-gray-900">{formData.client}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
               {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
              ) : (
                  <p className="text-base text-gray-900">{formData.phone || 'N/A'}</p>
              )}
            </div>
        </div>
        
        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
               {isEditing ? (
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
              ) : (
                  <p className="text-base text-gray-900">{formData.guests || '1'}</p>
              )}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
               {isEditing ? (
                   <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                   >
                        <option value="booked">Booked</option>
                        <option value="blocked">Blocked / Maintenance</option>
                   </select>
               ) : (
                   <Badge variant={formData.status === 'booked' ? 'success' : 'info'}>
                    {formData.status}
                   </Badge>
               )}
            </div>
        </div>

        {/* Dates - Read Only for now as changing dates involves complex availability checks, user can delete and recreate if date changes needed, or we implement that later */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <p className="text-base text-gray-900">
              {checkInDate && !isNaN(checkInDate.getTime()) ? format(checkInDate, 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
             <p className="text-base text-gray-900">
              {checkOutDate && !isNaN(checkOutDate.getTime()) ? format(checkOutDate, 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Notes */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
           {isEditing ? (
               <textarea
                   name="notes"
                   rows="3"
                   value={formData.notes}
                   onChange={handleChange}
                   className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
               />
           ) : (
               <p className="text-base text-gray-900 whitespace-pre-wrap">{formData.notes || '-'}</p>
           )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
            {isEditing ? (
                <>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                    >
                        Save Changes
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={handleSendWhatsAppConfirmation}
                        disabled={!formData.phone}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        title={!formData.phone ? "Phone number required" : "Send confirmation via WhatsApp"}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Send Confirmation
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                        >
                            Edit Booking
                        </button>
                    </div>
                </>
            )}
        </div>

      </div>
        )}
    </Modal>
  )
}
