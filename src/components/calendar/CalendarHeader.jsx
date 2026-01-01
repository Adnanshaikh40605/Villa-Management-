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
      className="flex items-center gap-2 px-2 py-1 text-lg sm:text-xl font-bold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      onClick={onClick}
      ref={ref}
    >
      <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
      <span>{format(currentDate, 'MMMM yyyy')}</span>
    </button>
  ))

  return (
    <div className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-white border-b border-gray-200">
      
      {/* Month/Year Picker */}
      <div className="flex-1">
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
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onToday}
          className="hidden sm:flex text-xs py-1 h-7"
        >
          Today
        </Button>
        
        <div className="flex items-center">
          <button
            onClick={onPrev}
            className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="Previous Month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="Next Month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Today Button (as icon or small text) */}
        <button 
            onClick={onToday}
            className="sm:hidden text-xs font-medium text-primary-600 px-2 py-1 rounded bg-primary-50 ml-1"
        >
            Today
        </button>
      </div>
    </div>
  )
}
