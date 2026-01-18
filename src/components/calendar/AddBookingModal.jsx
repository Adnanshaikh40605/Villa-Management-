import React, { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { bookingsService } from '@/services/bookings'

export default function AddBookingModal({ isOpen, onClose, onSave, villa, date }) {
  // Initialize checkOutDate immediately from date prop
  const initialCheckOut = date ? format(addDays(new Date(date), 1), 'yyyy-MM-dd') : ''
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut)
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    number_of_guests: '',
    notes: '',
    status: 'booked',
    payment_status: 'pending',
    payment_method: 'online',
    advance_payment: '',
  })
  
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)

  const [pricePreview, setPricePreview] = useState({
    total_payment: null,
    nights: 0,
    isLoading: false,
    breakdown: null,
  })

  const [priceOverride, setPriceOverride] = useState({
    isEditing: false,
    customPrice: '',
  })

  // Update checkOutDate whenever date changes
  React.useEffect(() => {
    if (date) {
      const nextDay = addDays(new Date(date), 1)
      setCheckOutDate(format(nextDay, 'yyyy-MM-dd'))
    }
  }, [date])

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && date) {
        setFormData({
            client_name: '',
            client_phone: '',
            client_email: '',
            number_of_guests: '',
            notes: '',
            status: 'booked',
            payment_status: 'pending',
            payment_method: 'online',
            advance_payment: '',
        })
        setIsDetailsExpanded(false)
    }
  }, [isOpen, date])

  // Calculate price when villa or dates change
  useEffect(() => {
    console.log('Price calc useEffect:', { villa, date, checkOutDate, villaId: villa?.id })
    const fetchPrice = async () => {
      if (villa && date && checkOutDate) {
        setPricePreview(prev => ({ ...prev, isLoading: true }))
        try {
          console.log('Calling calculatePrice with:', villa.id, format(date, 'yyyy-MM-dd'), checkOutDate)
          const result = await bookingsService.calculatePrice(
            villa.id,
            format(date, 'yyyy-MM-dd'),
            checkOutDate
          )
          console.log('Price result:', result)
          setPricePreview({
            total_payment: result.total_payment,
            nights: result.nights,
            breakdown: result.auto_calculated_price,
            isLoading: false,
          })
          // Reset override when dates or villa change
          setPriceOverride({ isEditing: false, customPrice: '' })
        } catch (error) {
          console.error('Failed to calculate price:', error)
          setPricePreview({ total_payment: null, nights: 0, breakdown: null, isLoading: false })
        }
      } else {
        console.log('Skipping price calc - missing data')
        setPricePreview({ total_payment: null, nights: 0, isLoading: false })
      }
    }
    fetchPrice()
  }, [villa, date, checkOutDate])

  const effectivePrice = priceOverride.isEditing && priceOverride.customPrice 
    ? priceOverride.customPrice 
    : pricePreview.total_payment

  const pendingPayment = effectivePrice 
    ? (parseFloat(effectivePrice) - parseFloat(formData.advance_payment || 0))
    : 0

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Validation for Phone Number: only numbers, max 10 digits
    if (name === 'client_phone') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Determine payment fields
    const total = pricePreview.total_payment ? parseFloat(pricePreview.total_payment) : 0
    const advance = formData.advance_payment ? parseFloat(formData.advance_payment) : 0
    
    // Calculate status based on amounts
    let payStatus = 'pending'
    if (advance >= total && total > 0) payStatus = 'full'
    else if (advance > 0) payStatus = 'advance'

    const bookingData = {
        ...formData,
        client_email: formData.client_email,
        number_of_guests: formData.number_of_guests ? parseInt(formData.number_of_guests) : null,
        villa: villa.id,
        check_in: format(date, 'yyyy-MM-dd'),
        check_out: checkOutDate,
        total_payment: total,
        advance_payment: advance,
        payment_status: payStatus,
        payment_method: formData.payment_method,
    }

    // Add override price if custom pricing is enabled
    if (priceOverride.isEditing && priceOverride.customPrice) {
      bookingData.override_total_payment = parseFloat(priceOverride.customPrice)
    }

    onSave(bookingData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                New Booking - {villa?.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {format(date, 'dd MMM yyyy')}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="client_name" className="block text-xs font-medium text-gray-700">Client Name</label>
                      <input
                        type="text"
                        name="client_name"
                        id="client_name"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.client_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                        <label htmlFor="client_phone" className="block text-xs font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            name="client_phone"
                            id="client_phone"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.client_phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Row 2: Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                         <label className="block text-xs font-medium text-gray-700">Check-in</label>
                         <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 bg-gray-50 text-gray-500 sm:text-sm">
                             {format(date, 'yyyy-MM-dd')}
                         </div>
                    </div>
                    <div>
                         <label htmlFor="check_out_date" className="block text-xs font-medium text-gray-700">Check-out</label>
                         <input
                            type="date"
                            name="check_out_date"
                            id="check_out_date"
                            required
                            min={format(new Date(date.getTime() + 86400000), 'yyyy-MM-dd')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                         />
                    </div>
                </div>

                {/* Row 3: Guests & Status */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="number_of_guests" className="block text-xs font-medium text-gray-700">Guests</label>
                        <input
                            type="number"
                            name="number_of_guests"
                            id="number_of_guests"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.number_of_guests}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-xs font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            id="status"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="booked">Booked</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>


                {/* Notes and Payment Method - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            id="notes"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Add any special requests or notes..."
                        ></textarea>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label htmlFor="payment_method" className="block text-xs font-medium text-gray-700 mb-1">Payment Details</label>
                        <select
                            name="payment_method"
                            id="payment_method"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.payment_method}
                            onChange={handleChange}
                        >
                            <option value="online">Online</option>
                            <option value="cash">Cash</option>
                        </select>
                    </div>
                </div>

                {/* Price Breakdown - Full Width */}
                {pricePreview.breakdown && !priceOverride.isEditing && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-[10px] font-medium text-blue-900 mb-1">Price Breakdown</p>
                    <div className="flex gap-2 text-[10px] flex-wrap">
                      {pricePreview.breakdown.base_nights > 0 && (
                        <div className="bg-white rounded px-2 py-1">
                          <span className="text-gray-600">Base: {pricePreview.breakdown.base_nights}n</span>
                        </div>
                      )}
                      {pricePreview.breakdown.weekend_nights > 0 && (
                        <div className="bg-white rounded px-2 py-1">
                          <span className="text-gray-600">Weekend: {pricePreview.breakdown.weekend_nights}n</span>
                        </div>
                      )}
                      {pricePreview.breakdown.special_nights > 0 && (
                        <div className="bg-white rounded px-2 py-1">
                          <span className="text-gray-600">Special: {pricePreview.breakdown.special_nights}n</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Price Input - Full Width */}
                {priceOverride.isEditing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-[10px] font-medium text-yellow-900 mb-1">
                      Custom Price
                      <span className="ml-1 text-yellow-700">(Auto: ₹{parseFloat(pricePreview.total_payment).toLocaleString()})</span>
                    </p>
                    <input
                      type="number"
                      value={priceOverride.customPrice}
                      onChange={(e) => setPriceOverride({ ...priceOverride, customPrice: e.target.value })}
                      className="w-full border border-yellow-300 rounded shadow-sm py-1 px-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-xs font-semibold"
                      placeholder="Enter custom price"
                    />
                  </div>
                )}

                {/* Pricing Details - Full Width */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-medium text-gray-600">
                            Total
                            {priceOverride.isEditing && (
                              <span className="ml-1 text-yellow-600">(Custom)</span>
                            )}
                          </label>
                          {pricePreview.total_payment && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!priceOverride.isEditing) {
                                  setPriceOverride({ 
                                    isEditing: true, 
                                    customPrice: pricePreview.total_payment 
                                  })
                                } else {
                                  setPriceOverride({ isEditing: false, customPrice: '' })
                                }
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded border border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-0.5"
                            >
                              {priceOverride.isEditing ? (
                                <>
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Edit
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className={`mt-1 block w-full border rounded-md shadow-sm py-1.5 px-2 font-semibold text-xs sm:text-sm truncate ${
                          priceOverride.isEditing 
                            ? 'border-yellow-300 bg-yellow-50 text-yellow-900' 
                            : 'border-gray-300 bg-gray-50 text-gray-900'
                        }`}>
                            {pricePreview.isLoading ? (
                                <span className="text-gray-400">...</span>
                            ) : effectivePrice ? (
                                `₹${parseFloat(effectivePrice).toLocaleString()}`
                            ) : (
                                <span className="text-gray-400">₹0</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="advance_payment" className="block text-[10px] font-medium text-gray-600 mb-1">Advance</label>
                        <input
                            type="number"
                            name="advance_payment"
                            id="advance_payment"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                            value={formData.advance_payment}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">Pending</label>
                        <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 bg-gray-50 text-red-600 font-semibold text-xs sm:text-sm truncate">
                            ₹{parseFloat(pendingPayment).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Additional Details (Collapsible) */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                    <button 
                        type="button"
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
                                <label htmlFor="client_email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                <input
                                    type="email"
                                    name="client_email"
                                    id="client_email"
                                    placeholder="client@example.com"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={formData.client_email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Booking
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
