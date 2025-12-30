import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useGetCalendarBookingsQuery } from '@/services/api/bookingApi'
import { useGetVillasQuery } from '@/services/api/villaApi'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import BookingModal from '@/components/booking/BookingModal'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedVilla, setSelectedVilla] = useState('')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState(null)
  
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
    alert(`Villa: ${villa}\nClient: ${client}\nStatus: ${status}\nDates: ${info.event.start.toLocaleDateString()} - ${info.event.end.toLocaleDateString()}`)
  }

  const handleDateSelect = (selectInfo) => {
    setSelectedDates({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setBookingModalOpen(true)
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
      <Card>
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={window.innerWidth < 768 ? 'timeGridDay' : 'dayGridMonth'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: window.innerWidth < 768 ? 'timeGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            height="auto"
            contentHeight="auto"
            aspectRatio={window.innerWidth < 768 ? 1.2 : 1.8}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            slotLabelFormat={{
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
          />
        </div>
      </Card>

      {/* Legend */}
      <Card title="Legend">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Blocked</span>
          </div>
        </div>
      </Card>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false)
          setSelectedDates(null)
        }}
        selectedDates={selectedDates}
        villas={villas}
      />
    </div>
  )
}
