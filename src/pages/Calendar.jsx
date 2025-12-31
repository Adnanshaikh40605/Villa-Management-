import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useGetCalendarBookingsQuery } from '@/services/api/bookingApi'
import { useGetVillasQuery } from '@/services/api/villaApi'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import BookingDetailsModal from '@/components/booking/BookingDetailsModal'

export default function Calendar() {
  const navigate = useNavigate()
  const calendarRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedVilla, setSelectedVilla] = useState('')
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  
  const start = format(startOfMonth(addMonths(currentDate, -1)), 'yyyy-MM-dd')
  const end = format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd')

  const { data: bookings, isLoading: bookingsLoading } = useGetCalendarBookingsQuery({ 
    start, 
    end,
    villa: selectedVilla || undefined 
  })
  const { data: villasData, isLoading: villasLoading } = useGetVillasQuery({})
  
  const villas = villasData?.results || villasData || []

  const events = bookings?.map((booking) => ({
    id: booking.id,
    title: `${booking.villa_name} - ${booking.client_name}`,
    start: booking.check_in,
    end: booking.check_out,
    backgroundColor: booking.status === 'booked' ? '#3b82f6' : '#6b7280',
    borderColor: booking.status === 'booked' ? '#2563eb' : '#4b5563',
    extendedProps: {
      villa: booking.villa_name,
      client: booking.client_name,
      status: booking.status,
    },
  })) || []

  const handleEventClick = (info) => {
    const { villa, client, status } = info.event.extendedProps
    setSelectedBooking({
      villa,
      client,
      status,
      checkIn: info.event.start,
      checkOut: info.event.end,
    })
    setBookingDetailsOpen(true)
  }

  const handleDateSelect = (selectInfo) => {
    navigate('/bookings/create', {
      state: {
        selectedDates: {
          start: selectInfo.start,
          end: selectInfo.end,
        }
      }
    })
  }

  const handleDateClick = (info) => {
    // Navigate to create booking for the clicked date
    // Set end date to the next day for a 1-night default
    const endDate = new Date(info.date)
    endDate.setDate(endDate.getDate() + 1)
    
    navigate('/bookings/create', {
      state: {
        selectedDates: {
          start: info.date,
          end: endDate,
        }
      }
    })
  }

  // Navigation Handlers
  const handlePrev = () => {
    calendarRef.current.getApi().prev()
  }

  const handleNext = () => {
    calendarRef.current.getApi().next()
  }

  const handleToday = () => {
    calendarRef.current.getApi().today()
  }

  const handleDateChange = (date) => {
    calendarRef.current.getApi().gotoDate(date)
  }

  // Swipe Handlers
  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: false
  })

  // Update current date when calendar view changes (e.g. via internal navigation if enabled)
  const handleDatesSet = (arg) => {
    // Prevent infinite loops by checking if the date actually changed
    if (arg.view.currentStart.getTime() !== currentDate.getTime()) {
      setCurrentDate(arg.view.currentStart)
    }
  }

  if (bookingsLoading || villasLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">

      {/* Villa Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Villa:</label>
          <div className="flex-1 flex items-center gap-2">
            <select
              value={selectedVilla}
              onChange={(e) => setSelectedVilla(e.target.value)}
              className="input flex-1 sm:max-w-xs"
            >
              <option value="">All Villas</option>
              {villas.map((villa) => (
                <option key={villa.id} value={villa.id}>
                  {villa.name} - {villa.location}
                </option>
              ))}
            </select>
            {selectedVilla && (
              <button
                onClick={() => setSelectedVilla('')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="overflow-hidden">
        {/* Custom Header */}
        <CalendarHeader 
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onDateChange={handleDateChange}
        />
        
        <div className="calendar-container" {...handlers}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={window.innerWidth < 768 ? 'dayGridMonth' : 'dayGridMonth'}
            headerToolbar={false} // Hide default header
            events={events}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            height="auto"
            contentHeight="auto"
            aspectRatio={window.innerWidth < 768 ? 0.8 : 1.8} // Taller on mobile for better touch targets
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            validRange={{
              start: new Date().toISOString().split('T')[0]
            }}
            selectAllow={(selectInfo) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return selectInfo.start >= today
            }}
            longPressDelay={0}
            eventLongPressDelay={100} // Slight delay to prevent accidental drags
            selectLongPressDelay={100}
          />
        </div>
      </Card> 

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={bookingDetailsOpen}
        onClose={() => {
          setBookingDetailsOpen(false)
          setSelectedBooking(null)
        }}
        booking={selectedBooking}
      />
    </div>
  )
}
