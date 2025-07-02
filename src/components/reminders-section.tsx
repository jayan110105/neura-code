"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { IconPlus, IconCalendarFilled, IconAlarmFilled, IconRepeat } from "@tabler/icons-react"

const mockReminders = [
  {
    id: 1,
    title: "Team standup meeting",
    description: "Daily standup with the development team",
    time: "09:00",
    date: "2024-01-16",
    repeat: "Daily",
    enabled: true,
    category: "Work",
  },
  {
    id: 2,
    title: "Take medication",
    description: "Remember to take vitamin D supplement",
    time: "20:00",
    date: "2024-01-15",
    repeat: "Daily",
    enabled: true,
    category: "Health",
  },
  {
    id: 3,
    title: "Call mom",
    description: "Weekly check-in call with family",
    time: "15:00",
    date: "2024-01-17",
    repeat: "Weekly",
    enabled: false,
    category: "Personal",
  },
  {
    id: 4,
    title: "Review monthly expenses",
    description: "Go through credit card statements and budget",
    time: "10:00",
    date: "2024-01-31",
    repeat: "Monthly",
    enabled: true,
    category: "Finance",
  },
]

export function RemindersSection() {
  const getRepeatVariant = (repeat: string) => {
    switch (repeat) {
      case "Daily":
        return "info"
      case "Weekly":
        return "success"
      case "Monthly":
        return "accent"
      default:
        return "secondary"
    }
  }

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case "Work":
        return "warning"
      case "Health":
        return "destructive"
      case "Personal":
        return "success"
      case "Finance":
        return "info"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Reminders</h1>
          <p className="text-muted-foreground text-lg">Never miss important tasks and events</p>
        </div>
        <Button className="text-sm !h-10 py-2 px-3" variant="outline">
          <IconPlus className="w-4 h-4 mr-2" />
          New Reminder
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {mockReminders.map((reminder) => {
          return (
            <Card key={reminder.id} className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader className="px-4 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">{reminder.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{reminder.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <IconCalendarFilled className="w-3 h-3" />
                      <span>{new Date(reminder.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                      <IconAlarmFilled className="w-3 h-3 ml-2" />
                      <span>{reminder.time}</span>
                    </div>
                  </div>
                  <Switch checked={reminder.enabled} className="data-[state=checked]:bg-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getRepeatVariant(reminder.repeat) as any} className="text-xs border">
                    <IconRepeat className="w-3 h-3 mr-1" />
                    {reminder.repeat}
                  </Badge>
                  <Badge variant={getCategoryVariant(reminder.category) as any} className="text-xs border-0">
                    {reminder.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
