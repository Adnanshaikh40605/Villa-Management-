import React from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import Button from '@/components/common/Button'
import { format } from 'date-fns'

export default function CalendarHeader({ 
  currentDate, 
  onPrev, 
  onNext, 
  onToday, 
  onDateChange 
}) {
  // Custom input for the date picker to make it look integrated
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      className="flex items-center gap-2 px-4 py-2 text-xl font-bold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      onClick={onClick}
      ref={ref}
    >
      <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
      <span>{format(currentDate, 'MMMM yyyy')}</span>
    </button>
  ))

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-b border-gray-200">
      
      {/* Month/Year Picker (Center on mobile, Left on desktop) */}
      <div className="order-1 sm:order-2">
        <DatePicker
          selected={currentDate}
          onChange={(date) => onDateChange(date)}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          customInput={<CustomInput />}
          popperClassName="z-50"
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-auto justify-between sm:justify-start">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onToday}
          className="hidden sm:flex"
        >
          Today
        </Button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="Previous Month"
          >
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="Next Month"
          >
            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mobile Today Button (shown on right) */}
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onToday}
          className="flex sm:hidden"
        >
          Today
        </Button>
      </div>

      {/* View Switcher Placeholder (if needed in future) */}
      <div className="order-3 hidden sm:block w-24"></div> 
    </div>
  )
}
