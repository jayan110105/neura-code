"use client"

import { Card, CardContent } from "@/components/ui/card"
import { IconAlarmFilled, IconRepeat, IconTagFilled } from "@tabler/icons-react"
import { Reminder } from "@/types"

interface RemindersListProps {
  reminders: Reminder[]
  onReminderClick?: (reminder: Reminder) => void
  onReminderToggle?: (reminderId: number) => void
}

export function RemindersList({ reminders, onReminderClick }: RemindersListProps) {
  if (reminders.length === 0) return null

  const getRepeatColorClass = (repeat: string) => {
    switch (repeat) {
      case "Daily":
        return "text-[#2383e2]"
      case "Weekly":
        return "text-[#22c55e]"
      case "Monthly":
        return "text-[#a855f7]"
      case "None":
        return "text-muted-foreground"
    }
  }

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case "Work":
        return "text-[#ffb110]"
      case "Health":
        return "text-[#de5550]"
      case "Personal":
        return "text-[#22c55e]" 
      case "Finance":
        return "text-[#2383e2]"
    }
  }

  const handleReminderClick = (reminder: Reminder) => {
    if (onReminderClick) {
      onReminderClick(reminder)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-foreground mb-4 flex flex-col gap-2">
        Reminders
      </h2>
      <Card className="bg-card border-none">
        <CardContent className="px-4">
          <div className="space-y-2">
            {reminders.map((reminder, index) => (
              <div 
                key={reminder.id} 
                className={`flex items-start justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer`}
                onClick={() => handleReminderClick(reminder)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground text-sm truncate">{reminder.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {reminder.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconAlarmFilled className="w-3 h-3" />
                          <span>{reminder.time}</span>
                        </div>
                      )}
                      {reminder.repeat && reminder.repeat !== "None" && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconRepeat className={`w-3 h-3 ${getRepeatColorClass(reminder.repeat)}`} />
                          {reminder.repeat}
                        </div>
                      )}
                      {reminder.category && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconTagFilled className={`w-3 h-3 ${getCategoryColorClass(reminder.category)}`} />
                          {reminder.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 