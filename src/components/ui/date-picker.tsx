import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "@heroicons/react/24/outline"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate)
    setOpen(false) // Close popover after selection
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal text-sm sm:text-base truncate",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {date ? format(date, "dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          initialFocus
          className="text-sm"
        />
      </PopoverContent>
    </Popover>
  )
}
