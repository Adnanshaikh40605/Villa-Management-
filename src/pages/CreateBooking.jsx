import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCreateBookingMutation } from '@/services/api/bookingApi'
import { useGetVillasQuery } from '@/services/api/villaApi'
import { bookingsService } from '@/services/bookings'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CreateBooking() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedDates = location.state?.selectedDates

  const [formData, setFormData] = useState({
    villa: '',
    client_name: '',
    client_phone: '',
    guests: 1,
    status: 'booked',
    payment_status: 'pending',
    advance_payment: '',
  })

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

  const { data: villasData, isLoading: villasLoading } = useGetVillasQuery()
  const [createBooking, { isLoading }] = useCreateBookingMutation()

  const villas = villasData?.results || villasData || []

  // Calculate price when villa or dates change
  useEffect(() => {
    const fetchPrice = async () => {
      if (formData.villa && selectedDates) {
        setPricePreview(prev => ({ ...prev, isLoading: true }))
        try {
          const result = await bookingsService.calculatePrice(
            formData.villa,
            format(selectedDates.start, 'yyyy-MM-dd'),
            format(selectedDates.end, 'yyyy-MM-dd')
          )
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
        setPricePreview({ total_payment: null, nights: 0, breakdown: null, isLoading: false })
      }
    }
    fetchPrice()
  }, [formData.villa, selectedDates])


  const effectivePrice = priceOverride.isEditing && priceOverride.customPrice 
    ? priceOverride.customPrice 
    : pricePreview.total_payment

  const pendingPayment = effectivePrice 
    ? (parseFloat(effectivePrice) - parseFloat(formData.advance_payment || 0))
    : 0

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDates) {
      toast.error('Please select dates from the calendar')
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
        advance_payment: formData.payment_status === 'advance' ? formData.advance_payment : 0,
      }

      // Add override price if custom pricing is enabled
      if (priceOverride.isEditing && priceOverride.customPrice) {
        bookingData.override_total_payment = parseFloat(priceOverride.customPrice)
      }

      if (formData.status === 'booked') {
        bookingData.client_name = formData.client_name
        bookingData.client_phone = formData.client_phone
      }

      await createBooking(bookingData).unwrap()

      toast.success('Booking created successfully!')
      navigate('/calendar')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error?.data?.detail || 'Failed to create booking')
    }
  }

  if (villasLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Booking</h1>
        <p className="mt-1 text-gray-600">Add a new booking to your calendar</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Display */}
          {selectedDates && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-900">
                Selected Dates: {format(selectedDates.start, 'MMM dd, yyyy')} - {format(selectedDates.end, 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {!selectedDates && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900">
                Please select dates from the calendar first
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
                      onClick={() => setFormData({ ...formData, guests: formData.guests - 1 })}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg font-semibold">−</span>
                    </button>
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="input text-center flex-1"
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
              
              {formData.payment_status === 'advance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Advance Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="advance_payment"
                    value={formData.advance_payment}
                    onChange={handleChange}
                    required={formData.payment_status === 'advance'}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Payment Details with Price Override */}
              <div className="space-y-4 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Payment Details</h4>
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
                        className="text-xs px-3 py-1 rounded-md border border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-1"
                      >
                        {priceOverride.isEditing ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Override
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Price
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  {pricePreview.breakdown && !priceOverride.isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-blue-900">Auto-Calculated Price Breakdown</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {pricePreview.breakdown.base_nights > 0 && (
                          <div className="bg-white rounded p-2">
                            <p className="text-gray-600">Base Nights</p>
                            <p className="font-semibold text-gray-900">{pricePreview.breakdown.base_nights}</p>
                          </div>
                        )}
                        {pricePreview.breakdown.weekend_nights > 0 && (
                          <div className="bg-white rounded p-2">
                            <p className="text-gray-600">Weekend</p>
                            <p className="font-semibold text-gray-900">{pricePreview.breakdown.weekend_nights}</p>
                          </div>
                        )}
                        {pricePreview.breakdown.special_nights > 0 && (
                          <div className="bg-white rounded p-2">
                            <p className="text-gray-600">Special</p>
                            <p className="font-semibold text-gray-900">{pricePreview.breakdown.special_nights}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Price Input */}
                  {priceOverride.isEditing && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-900 mb-2">
                        Custom Price Override 
                        <span className="ml-1 text-yellow-700">(Auto-calculated: ₹{parseFloat(pricePreview.total_payment).toLocaleString()})</span>
                      </p>
                      <input
                        type="number"
                        value={priceOverride.customPrice}
                        onChange={(e) => setPriceOverride({ ...priceOverride, customPrice: e.target.value })}
                        className="w-full border border-yellow-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-sm font-semibold"
                        placeholder="Enter custom price"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3">
                      <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Total Payment
                            {priceOverride.isEditing && (
                              <span className="ml-1 text-yellow-600">(Custom)</span>
                            )}
                          </label>
                          <div className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 font-semibold sm:text-sm ${
                            priceOverride.isEditing 
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-900' 
                              : 'border-gray-300 bg-gray-50 text-gray-900'
                          }`}>
                              {pricePreview.isLoading ? (
                                  <span className="text-gray-400">Calculating...</span>
                              ) : effectivePrice ? (
                                  `₹${parseFloat(effectivePrice).toLocaleString()}`
                              ) : (
                                  <span className="text-gray-400">₹0</span>
                              )}
                          </div>
                      </div>

                      <div>
                          <label htmlFor="advance_payment" className="block text-xs font-medium text-gray-600 mb-1">Advance Payment</label>
                          <input
                              type="number"
                              name="advance_payment"
                              id="advance_payment"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              value={formData.advance_payment}
                              onChange={handleChange}
                              placeholder="0"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Pending Payment</label>
                          <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-red-600 font-semibold sm:text-sm">
                              ₹{parseFloat(pendingPayment).toLocaleString()}
                          </div>
                      </div>
                  </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/calendar')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!selectedDates}
            >
              Create Booking
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
