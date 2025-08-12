'use client'

import * as React from 'react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconCalendarFilled, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  selectedDate?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  showLabel?: boolean
  label?: string
  disablePastDates?: boolean
  allowClear?: boolean
}

export function DatePicker({
  selectedDate,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  showLabel = false,
  label = 'Date of birth',
  disablePastDates = false,
  allowClear = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-3">
      {showLabel && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn(
              'border-text-muted-foreground text-muted-foreground h-7 justify-start rounded-sm text-left text-xs font-normal',
              !selectedDate && 'text-muted-foreground',
              className,
            )}
          >
            <IconCalendarFilled className="h-3 w-3" />
            {selectedDate ? (
              format(selectedDate, 'd MMM')
            ) : (
              <span>{placeholder}</span>
            )}
            {allowClear && selectedDate && (
              <span
                role="button"
                tabIndex={0}
                className="inline-flex items-center rounded hover:text-foreground focus:outline-none"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDateChange?.(undefined)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onDateChange?.(undefined)
                  }
                }}
              >
                <IconX className="h-3 w-3" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            disabled={disablePastDates ? { before: new Date() } : undefined}
            onSelect={(date) => {
              onDateChange?.(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
