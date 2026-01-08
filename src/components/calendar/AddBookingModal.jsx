import React, { useState } from 'react'
import { format } from 'date-fns'

export default function AddBookingModal({ isOpen, onClose, onSave, villa, date }) {
  const [checkOutDate, setCheckOutDate] = useState('')
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    number_of_guests: '',
    notes: '',
    status: 'booked'
  })

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && date) {
        setFormData({
            client_name: '',
            client_phone: '',
            number_of_guests: '',
            notes: '',
            status: 'booked'
        })
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)
        setCheckOutDate(format(nextDay, 'yyyy-MM-dd'))
    }
  }, [isOpen, date])

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
    onSave({
        ...formData,
        number_of_guests: formData.number_of_guests ? parseInt(formData.number_of_guests) : null,
        villa: villa.id,
        check_in: format(date, 'yyyy-MM-dd'),
        check_out: checkOutDate
    })
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">Client Name</label>
                  <input
                    type="text"
                    name="client_name"
                    id="client_name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.client_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Check-in</label>
                         <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm">
                             {format(date, 'yyyy-MM-dd')}
                         </div>
                    </div>
                    <div>
                         <label htmlFor="check_out_date" className="block text-sm font-medium text-gray-700">Check-out</label>
                         <input
                            type="date"
                            name="check_out_date"
                            id="check_out_date"
                            required
                            min={format(new Date(date.getTime() + 86400000), 'yyyy-MM-dd')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                         />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="client_phone"
                            id="client_phone"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.client_phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="number_of_guests" className="block text-sm font-medium text-gray-700">Guests</label>
                        <input
                            type="number"
                            name="number_of_guests"
                            id="number_of_guests"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.number_of_guests}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        id="status"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="booked">Booked</option>
                        <option value="blocked">Blocked / Maintenance</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        name="notes"
                        id="notes"
                        rows="2"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>
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
