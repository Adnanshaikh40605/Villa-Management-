import React, { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import AddBookingModal from './AddBookingModal'

export default function CalendarTableView({ 
  bookings, 
  villas, 
  globalSpecialDays = [],
  currentDate,
  onBookingClick,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking
}) {
  const villasList = Array.isArray(villas) ? villas : (villas?.results || [])
  const [editingCell, setEditingCell] = useState(null) // { date: Date, villaId: string }
  const [inputValue, setInputValue] = useState('')
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState({ date: null, villa: null })

  const inputRef = useRef(null)

  // Generate all days for the current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).filter(day => {
    // Only show today and future dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return day >= today
  })

  const getBookingForDateAndVilla = (date, villaId) => {
    return bookings?.find(booking => {
      if (booking.villa !== villaId && booking.villa_id !== villaId) return false
      const start = parseISO(booking.check_in)
      const end = parseISO(booking.check_out)
      // Visual logic: include start date, exclude end date
      return (isSameDay(date, start) || date > start) && date < end
    })
  }
  
  const isBookingStart = (date, booking) => {
    if (!booking) return false
    return isSameDay(date, parseISO(booking.check_in))
  }

  const handleCellClick = (date, villaId, booking, villa) => {
    // If clicking an existing booking
    if (booking) {
        // ALWAYS open details modal, disable inline edit for now
        onBookingClick(booking)
    } else {
        // Empty cell -> Open Add Modal
        setSelectedSlot({ date, villa })
        setIsAddModalOpen(true)
    }
  }

  const handleModalSave = (bookingData) => {
      // Pass full data to parent
      onCreateBooking(bookingData)
  }

  const handleSave = async () => {
    if (!editingCell) return

    const { date, villaId } = editingCell
    const booking = getBookingForDateAndVilla(date, villaId)
    const trimmedValue = inputValue.trim()

    // Update or Delete logic (Creation loop removed as handled by modal)
    if (booking && trimmedValue && trimmedValue !== booking.client_name) {
        await onUpdateBooking(booking.id, trimmedValue)
    }

    if (booking && !trimmedValue) {
        await onDeleteBooking(booking.id)
    }

    cancelEdit()
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
    } else if (e.key === 'Escape') {
        cancelEdit()
    }
  }

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
        inputRef.current.focus()
    }
  }, [editingCell])


  const getVillaPrice = (date, villa) => {
    const day = date.getDay()
    
    // Priority 1: Check if this date falls within any special price range
    if (villa.special_prices && villa.special_prices.length > 0) {
      const dateStr = format(date, 'yyyy-MM-dd')
      
      for (const specialPrice of villa.special_prices) {
        const startDate = specialPrice.start_date
        const endDate = specialPrice.end_date
        
        // Check if current date is within this range (inclusive)
        if (dateStr >= startDate && dateStr <= endDate) {
          return `₹${Math.floor(parseFloat(specialPrice.price)).toLocaleString()}`
        }
      }
    }
    
    // Priority 2: Check if this date is a global special day
    if (globalSpecialDays && globalSpecialDays.length > 0 && villa.special_day_price) {
      const dateDay = date.getDate()
      const dateMonth = date.getMonth() + 1 // JS months are 0-indexed
      const dateYear = date.getFullYear()
      
      const isSpecialDay = globalSpecialDays.some(specialDay => {
        // Match day and month
        if (specialDay.day === dateDay && specialDay.month === dateMonth) {
          // If year is specified, it must match; otherwise day/month match is enough
          if (specialDay.year) {
            return specialDay.year === dateYear
          }
          return true
        }
        return false
      })
      
      if (isSpecialDay) {
        return `₹${Math.floor(parseFloat(villa.special_day_price)).toLocaleString()}`
      }
    }
    
    // Priority 3: Check if villa has weekend pricing configured and if today is a configured weekend day
    const isConfiguredWeekend = villa.weekend_days && villa.weekend_days.includes(day)
    
    // Priority 4: Weekend price (if configured and today is a weekend day), then base price
    let price = villa.price_per_night
    
    if (isConfiguredWeekend && villa.weekend_price) {
        price = villa.weekend_price
    }
    
    // Format and return the price
    if (!price || price === 0) {
        return '₹0'
    }
    
    return `₹${Math.floor(price).toLocaleString()}`
  }

  const getStatusColor = (booking) => {
    if (!booking) return ''
    if (booking.status === 'blocked') return 'bg-gray-200 text-gray-800'
    if (booking.status === 'tentative') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-900' // Default booked
  }

  return (
    <>
    <div className="overflow-auto border rounded-lg shadow sm:rounded-lg max-h-[75vh] relative bg-white touch-auto">
      <table className="min-w-max border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-30">
          <tr>
            {/* Corner Cell: Date Header */}
            <th 
              scope="col" 
              className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 top-0 z-40 bg-gray-100 border-r border-b border-gray-300 shadow-sm"
              style={{ minWidth: '120px', width: '120px' }}
            >
              Date
            </th>
            
            {/* Villa Headers */}
            {villasList.map((villa) => (
              <th 
                key={villa.id} 
                scope="col" 
                className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-b border-gray-200 min-w-[180px] bg-gray-50"
              >
                {villa.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {daysInMonth.map((day) => (
            <tr key={day.toString()} className="hover:bg-gray-50">
              {/* Sticky Row Header: Date */}
              <td className="px-4 py-3 text-sm font-bold text-gray-900 sticky left-0 z-20 bg-white border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col">
                    <span>{format(day, 'dd MMM yyyy')}</span>
                    <span className="text-xs text-gray-400 font-normal">{format(day, 'EEEE')}</span>
                </div>
              </td>

              {/* Villa Cells */}
              {villasList.map((villa) => {
                const booking = getBookingForDateAndVilla(day, villa.id);
                const isStart = isBookingStart(day, booking);
                const isEditing = editingCell?.date === day && editingCell?.villaId === villa.id;
                
                return (
                  <td 
                    key={`${day}-${villa.id}`} 
                    className={`
                        p-0 whitespace-nowrap text-sm border-r border-gray-200 relative h-12
                        ${!isEditing ? 'cursor-cell hover:ring-2 hover:ring-primary-400 hover:z-10' : ''}
                        ${booking ? getStatusColor(booking) : ''}
                    `}
                    onClick={() => handleCellClick(day, villa.id, booking, villa)}
                    title={booking ? `${booking.client_name} - ${booking.status}` : 'Click to add booking'}
                  >
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full h-full px-2 py-1 border-2 border-primary-500 outline-none bg-white text-gray-900"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                        />
                    ) : (
                        <div className={`px-2 py-1 h-full w-full flex items-center ${!isStart && booking ? 'opacity-70' : ''}`}>
                            {booking ? (
                                <span className="truncate w-full block font-medium">
                                    {isStart ? (
                                        <div className="flex flex-col justify-center h-full">
                                            <div className="flex items-center truncate">
                                                {booking.status === 'blocked' && <span className="mr-1">🔒</span>}
                                                <span className="truncate">{booking.client_name}</span>
                                            </div>
                                            {/* Show price in small text for booked cells too */}
                                            <span className="text-[10px] text-gray-600 font-normal leading-none mt-0.5">
                                                {getVillaPrice(day, villa)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="opacity-0 group-hover:opacity-50 transition-opacity">
                                             •
                                        </span>
                                    )}
                                </span>
                            ) : (
                                // Empty cell: Show price badge
                                <div className="w-full flex justify-start pl-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors">
                                        {getVillaPrice(day, villa)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Add Booking Modal */}
    <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleModalSave}
        villa={selectedSlot.villa}
        date={selectedSlot.date}
    />
    </>
  )
}
