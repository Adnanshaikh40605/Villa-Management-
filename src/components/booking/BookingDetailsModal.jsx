import { useState, useEffect } from 'react'
import { useGetBookingByIdQuery } from '@/services/api/bookingApi'
import Modal from '@/components/common/Modal'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { bookingsService } from '@/services/bookings'

export default function BookingDetailsModal({ isOpen, onClose, booking: initialBooking, onUpdate, onDelete, villas }) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: bookingDetails, isLoading } = useGetBookingByIdQuery(initialBooking?.id, {
      skip: !initialBooking?.id
  })

  // Use full details if available, otherwise fall back to initial (summary) data
  const booking = bookingDetails || initialBooking

  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleSendEmailConfirmation = async () => {
      try {
          setIsSendingEmail(true)
          await bookingsService.sendEmailConfirmation(booking.id)
          toast.success('Email confirmation sent successfully')
      } catch (error) {
          console.error('Failed to send email:', error)
          toast.error('Failed to send email confirmation')
      } finally {
          setIsSendingEmail(false)
      }
  }

  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    email: '',
    guests: '',
    status: '',
    notes: '',
    villa_id: '',
    check_in: '',
    check_out: '',
    advance_payment: 0
  })

  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        client: booking.client_name || booking.client || '', // Handle different naming conventions
        phone: booking.client_phone || booking.phone || '',
        email: booking.client_email || booking.email || '',
        guests: booking.number_of_guests || booking.guests || 1,
        status: booking.status || 'booked',
        notes: booking.notes || '',
        villa_id: booking.villa?.id || booking.villa || booking.villa_id || '', // Handle object or ID
        check_in: booking.check_in || booking.checkIn,
        check_out: booking.check_out || booking.checkOut,
        advance_payment: booking.advance_payment || 0
      })
      // Only reset editing state if we're opening a fresh modal, not during re-renders
      if (!isEditing) setIsEditing(false)
      // Reset expanded state when opening new modal
      setIsDetailsExpanded(false)
    }
  }, [booking, isOpen])

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)

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
         client_email: formData.email,
         number_of_guests: formData.guests,
         status: formData.status,
         notes: formData.notes,
         villa: typeof formData.villa_id === 'object' ? formData.villa_id.id : formData.villa_id,
         check_in: formData.check_in,
         check_out: formData.check_out,
         advance_payment: formData.advance_payment
     })
  }

  const handleDelete = () => {
      onDelete(booking.id)
  }

  const handleSendWhatsAppConfirmation = () => {
    // Get phone number from formData as it might be edited
    let phoneNumber = formData.phone.replace(/\D/g, '')
    
    // If phone doesn't start with country code, assume India (+91)
    if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber
    }

    // Format dates used in the message
    // Template needs: "12th January 2026" (No time as per latest request)
    const checkInDateObj = formData.check_in ? new Date(formData.check_in) : null
    const checkOutDateObj = formData.check_out ? new Date(formData.check_out) : null

    const checkInFormatted = checkInDateObj && !isNaN(checkInDateObj.getTime())
      ? format(checkInDateObj, 'do MMMM yyyy')
      : 'TBD'
      
    const checkOutFormatted = checkOutDateObj && !isNaN(checkOutDateObj.getTime())
      ? format(checkOutDateObj, 'do MMMM yyyy')
      : 'TBD'

    // Villa Name
    let villaName = booking.villa_name || booking.villa?.name || 'Villa'
    if (formData.villa_id && villas) {
        const selectedV = villas.find(v => v.id == (typeof formData.villa_id === 'object' ? formData.villa_id.id : formData.villa_id))
        if (selectedV) villaName = selectedV.name
    }

    // Payment Calculations
    const total = parseFloat(booking.total_payment || 0)
    const advance = parseFloat(formData.advance_payment || 0)
    const pending = total - advance

    // Using Surrogate Pairs for maximum compatibility
    const message = `Dear ${formData.client},

Booking Confirmation – ${villaName}.

Thank you for booking with us.
We’re pleased to confirm your ${villaName} booking.

Booking Details:
Villa Type: ${villaName}
 Check-in: ${checkInFormatted}
 Check-out: ${checkOutFormatted}

Payment of Rs ${advance} received as confirmation, remaining payment of Rs ${pending} you can do at checkin.

Your booking is successfully confirmed. The villa will be thoroughly cleaned, fully prepared, and ready before your arrival to ensure a smooth and comfortable stay.

If you need any assistance or have any questions, please feel free to contact us anytime.

Warm regards,
Vacation BNA
8976203444
9619777136
vacationbna.com`

    // Encode the message
    const encodedMessage = encodeURIComponent(message)
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

        {/* Payment Details */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700">Payment Details</h4>
            
            <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Payment</label>
                  <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-900 font-semibold sm:text-sm">
                    ₹{booking.total_payment || '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Advance Payment</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="advance_payment"
                        value={formData.advance_payment}
                        onChange={handleChange}
                        placeholder="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    ) : (
                      <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-green-600 font-semibold sm:text-sm">
                        ₹{booking.advance_payment || '0'}
                      </div>
                    )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pending Payment</label>
                  <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-red-600 font-semibold sm:text-sm">
                    ₹{booking.pending_payment || '0'}
                  </div>
                </div>
            </div>
        </div>



        {/* Additional Details (Collapsible) */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
            <button 
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 focus:outline-none"
            >
                <span className="text-sm font-medium text-gray-700">Additional Details</span>
                <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isDetailsExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            <div 
                className={`transition-all duration-300 ease-in-out ${isDetailsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="p-4 bg-white space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="client@example.com"
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        ) : (
                            <div className="flex items-center text-gray-900">
                                {formData.email ? (
                                    <>
                                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href={`mailto:${formData.email}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                                            {formData.email}
                                        </a>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">No email provided</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
                        WhatsApp
                    </button>
                    
                    <button
                        onClick={handleSendEmailConfirmation}
                        disabled={isSendingEmail}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Send confirmation via Email"
                    >
                        {isSendingEmail ? (
                           <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                           </svg>
                        )}
                        Email
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
