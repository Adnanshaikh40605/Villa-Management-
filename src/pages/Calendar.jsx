import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarTableView from '@/components/calendar/CalendarTableView'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useGetCalendarBookingsQuery, useCreateBookingMutation, useUpdateBookingMutation, useDeleteBookingMutation } from '@/services/api/bookingApi'
import { useGetVillasQuery } from '@/services/api/villaApi'
import { format, startOfMonth, endOfMonth, addMonths, parseISO, addDays } from 'date-fns'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import BookingDetailsModal from '@/components/booking/BookingDetailsModal'
import { TableCellsIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function Calendar() {
  const navigate = useNavigate()
  const calendarRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedVilla, setSelectedVilla] = useState('')
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [viewMode, setViewMode] = useState('table') // Default to table view
  
  const start = format(startOfMonth(addMonths(currentDate, -1)), 'yyyy-MM-dd')
  const end = format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd')

  const { data: bookings, isLoading: bookingsLoading } = useGetCalendarBookingsQuery({ 
    start, 
    end,
    villa: selectedVilla || undefined 
  })
  const { data: villasData, isLoading: villasLoading } = useGetVillasQuery({})
  
  // Mutation Hooks
  const [createBooking] = useCreateBookingMutation()
  const [updateBooking] = useUpdateBookingMutation()
  const [deleteBooking] = useDeleteBookingMutation()
  
  const villas = villasData?.results || villasData || []

  // Interactive Handlers for Table View
  const handleCreateBooking = async (arg1, arg2, arg3) => {
    try {
      let bookingPayload;
      
      // Check if first argument is the booking object (from Modal)
      if (typeof arg1 === 'object' && !arg1.preventDefault) { // Simple object check
         bookingPayload = arg1;
      } else {
         // Legacy: (villaId, date, clientName)
         const villaId = arg1;
         const date = arg2;
         const clientName = arg3;
         // Format dates if they are Date objects
         // Note: CalendarTableView passed formatted strings from Modal, but legacy might pass Date objects
         // checking if date is available
         if (!date) return; 
         
         const checkIn = date instanceof Date ? format(date, 'yyyy-MM-dd') : date;
         const checkOut = date instanceof Date ? format(addDays(new Date(date), 1), 'yyyy-MM-dd') : 
                          // If date is string, we assume it's yyyy-MM-dd, parse it or just handle it. 
                          // Original code assumed Date object.
                          format(addDays(new Date(date), 1), 'yyyy-MM-dd');

         bookingPayload = {
            villa: villaId,
            client_name: clientName,
            check_in: checkIn,
            check_out: checkOut,
            status: 'booked',
            guests: 1,
         }
      }

      await createBooking(bookingPayload).unwrap()
    } catch (error) {
      console.error('Failed to create booking:', error)
      alert("Failed to create booking. Please check for overlaps.")
    }
  }

  const handleUpdateBooking = async (bookingId, clientName) => {
    try {
      await updateBooking({
        id: bookingId,
        client_name: clientName,
      }).unwrap()
    } catch (error) {
       console.error('Failed to update booking:', error)
       alert("Failed to update booking.")
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    try {
       if (window.confirm("Are you sure you want to delete this booking?")) {
         await deleteBooking(bookingId).unwrap()
       }
    } catch (error) {
       console.error('Failed to delete booking:', error)
       alert("Failed to delete booking.")
    }
  }

  const events = bookings?.map((booking) => ({
    id: booking.id,
    title: `${booking.villa_name} - ${booking.client_name}`,
    start: booking.check_in,
    end: booking.check_out,
    backgroundColor: booking.status === 'booked' ? '#3b82f6' : '#6b7280',
    borderColor: booking.status === 'booked' ? '#2563eb' : '#4b5563',
    extendedProps: {
      villa: booking.villa_name,
      villa_id: booking.villa, 
      client: booking.client_name,
      status: booking.status,
    },
  })) || []

  const handleEventClick = (info) => {
    // Info structure depends on source (FullCalendar vs Custom Table)
    // If it's from FullCalendar, it has info.event.extendedProps
    // If passed directly from TableView, it might be the raw booking object
    
    let bookingData;
    
    if (info.event) {
       // From FullCalendar
       const { villa, client, status } = info.event.extendedProps
       bookingData = {
          villa, 
          client,
          status,
          checkIn: info.event.start,
          checkOut: info.event.end
       }
    } else {
       // Raw booking object
       bookingData = {
         villa: info.villa_name,
         client: info.client_name,
         status: info.status,
         checkIn: parseISO(info.check_in),
         checkOut: parseISO(info.check_out)
       }
    }

    setSelectedBooking(bookingData)
    setBookingDetailsOpen(true)
  }

  // Need parseISO for the manual handler above if imported
  // But wait, the component imports it. Let's make sure we have access to it or pass correct data.
  // Actually handleEventClick for TableView calls: onBookingClick(booking)
  // So 'info' is 'booking'.
  
  const handleBookingClick = (booking) => {
      setSelectedBooking({
        villa: booking.villa_name,
        client: booking.client_name,
        phone: booking.client_phone,
        guests: booking.number_of_guests,
        status: booking.status,
        checkIn: new Date(booking.check_in),
        checkOut: new Date(booking.check_out),
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
    const newDate = addMonths(currentDate, -1)
    setCurrentDate(newDate)
    if (calendarRef.current) {
        calendarRef.current.getApi().prev()
    }
  }

  const handleNext = () => {
    const newDate = addMonths(currentDate, 1)
    setCurrentDate(newDate)
    if (calendarRef.current) {
        calendarRef.current.getApi().next()
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    if (calendarRef.current) {
        calendarRef.current.getApi().today()
    }
  }

  const handleDateChange = (date) => {
    setCurrentDate(date)
    if (calendarRef.current) {
        calendarRef.current.getApi().gotoDate(date)
    }
  }

  // Swipe Handlers
  const handlers = useSwipeable({
    onSwipedLeft: viewMode === 'calendar' ? handleNext : undefined,
    onSwipedRight: viewMode === 'calendar' ? handlePrev : undefined,
    preventScrollOnSwipe: viewMode === 'calendar', // Allow scroll in table view
    trackMouse: false
  })

  // Update current date when calendar view changes (e.g. via internal navigation if enabled)
  const handleDatesSet = (arg) => {
    // Only update if significantly different to avoid loops
    // But since we control state externally for Table View, we sync them.
    if (arg.view.currentStart.getTime() !== currentDate.getTime()) {
      // setCurrentDate(arg.view.currentStart) 
      // This might cause loop if we are also setting it via state -> calendar props
      // Let's rely on our external controls primarily.
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
    <div className="space-y-4">

      {/* Controls Bar Removed as per user request */}

      {/* Main Content */}
      <Card className="overflow-hidden !p-0">
        {/* Shared Header for Navigation */}
        <CalendarHeader 
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onDateChange={handleDateChange}
        />

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-4 p-2 bg-gray-50 border-b border-gray-200 text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Legend:</span>
            
            <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    ₹ Price
                </span>
                <span className="text-gray-600">Available</span>
            </div>

            <div className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 rounded bg-blue-100 border border-blue-200"></span>
                <span className="text-gray-600">Booked</span>
            </div>

            <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-200 border border-gray-300 text-[10px]">
                    🔒
                </span>
                <span className="text-gray-600">Blocked</span>
            </div>
        </div>
        
        <div className="p-2 min-h-[500px]" {...handlers}>
            {viewMode === 'table' ? (
                <CalendarTableView 
                    bookings={bookings}
                    villas={villas}
                    currentDate={currentDate}
                    onBookingClick={handleBookingClick}
                    onCreateBooking={handleCreateBooking}
                    onUpdateBooking={handleUpdateBooking}
                    onDeleteBooking={handleDeleteBooking}
                />
            ) : (
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={window.innerWidth < 768 ? 'dayGridMonth' : 'dayGridMonth'}
                    headerToolbar={false} 
                    events={events} // Pass the processed events
                    initialDate={currentDate} // Sync date
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
                    aspectRatio={window.innerWidth < 768 ? 0.8 : 1.8} 
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
                    eventLongPressDelay={100} 
                    selectLongPressDelay={100}
                />
            )}
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
