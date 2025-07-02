"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus, IconCalendarFilled, IconAlarmFilled, IconRepeat, IconTrash, IconTagFilled } from "@tabler/icons-react"
import TextareaAutosize from "react-textarea-autosize"
import { mockReminders, Reminder } from "@/data/reminders"

type ReminderForm = {
  title: string
  description: string
  time: string
  date?: Date
  repeat: "Daily" | "Weekly" | "Monthly" | "None"
  category: "Work" | "Health" | "Personal" | "Finance"
}

export function RemindersSection() {
  const [reminders, setReminders] = useState<Reminder[]>([...mockReminders])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const [formData, setFormData] = useState<ReminderForm>({
    title: "",
    description: "",
    time: "9:00 AM",
    repeat: "Daily",
    category: "Work",
  })

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
        options.push(timeString)
      }
    }
    return options
  }
  const timeOptions = generateTimeOptions()

  const openCreateModal = () => {
    setEditingReminder(null)
    setFormData({
      title: "",
      description: "",
      time: "9:00 AM",
      repeat: "Daily",
      category: "Work",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description,
      time: reminder.time,
      date: new Date(reminder.date),
      repeat: reminder.repeat,
      category: reminder.category,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReminder(null)
  }

  const saveReminder = () => {
    if (!formData.title.trim()) return

    if (editingReminder) {
      // Update existing reminder
      setReminders(prev =>
        prev.map(r =>
          r.id === editingReminder.id
            ? {
                ...r,
                ...formData,
                date: formData.date ? format(formData.date, "yyyy-MM-dd") : r.date,
              }
            : r
        )
      )
    } else {
      // Create new reminder
      const newReminder: Reminder = {
        id: Date.now(),
        enabled: true,
        ...formData,
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      }
      setReminders(prev => [...prev, newReminder])
    }
    closeModal()
  }
  
  const deleteReminder = (id: number) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    closeModal()
  }

  const toggleReminder = (id: number) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const getRepeatColorClass = (repeat: string) => {
    switch (repeat) {
      case "Daily":
        return "text-[#2383e2]" // blue
      case "Weekly":
        return "text-[#22c55e]" // green
      case "Monthly":
        return "text-[#a855f7]" // purple
      default:
        return "text-muted-foreground"
    }
  }

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case "Work":
        return "text-[#ffb110]" // orange
      case "Health":
        return "text-[#de5550]" // red
      case "Personal":
        return "text-[#22c55e]" // green
      case "Finance":
        return "text-[#2383e2]" // blue
      default:
        return "text-muted-foreground"
    }
  }

  const isEditMode = Boolean(editingReminder)

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Reminders</h1>
          <p className="text-muted-foreground text-lg">Never miss important tasks and events</p>
        </div>
        <Button className="text-sm !h-10 py-2 px-3" variant="outline" onClick={openCreateModal}>
          <IconPlus className="w-4 h-4 mr-2" />
          New Reminder
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {reminders.map((reminder) => {
          return (
            <Card key={reminder.id} className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer group" onClick={() => openEditModal(reminder)}>
              <CardHeader className="px-4">
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
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteReminder(reminder.id)
                      }}
                    >
                      <IconTrash className="w-3 h-3" />
                    </Button>
                    <Switch checked={reminder.enabled} onCheckedChange={() => toggleReminder(reminder.id)} onClick={(e) => e.stopPropagation()} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconRepeat className={`w-3 h-3 ${getRepeatColorClass(reminder.repeat)}`} />
                    {reminder.repeat}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconTagFilled className={`w-3 h-3 ${getCategoryColorClass(reminder.category)}`} />
                    {reminder.category}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Modal for create & edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="border-none !pl-0 !text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <TextareaAutosize
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="flex w-full !pl-0 rounded-md bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              minRows={1}
            />
            <div className="flex gap-2 flex-wrap">
              <DatePicker
                selectedDate={formData.date}
                onDateChange={(date) => setFormData(prev => ({ ...prev, date: date }))}
              />
              <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({...prev, time: value}))}>
                <SelectTrigger
                  size="sm"
                  className="text-xs px-2 py-0 rounded-sm border-text-muted-foreground text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none"
                >
                  <IconAlarmFilled className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map(time => <SelectItem key={time} value={time} className="text-xs">{time}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={formData.repeat} onValueChange={(value) => setFormData(prev => ({...prev, repeat: value as any}))}>
                <SelectTrigger
                  size="sm"
                  className="text-xs px-2 py-0 rounded-sm border-text-muted-foreground text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none"
                >
                  <SelectValue placeholder="Repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None" className="text-xs">None</SelectItem>
                  <SelectItem value="Daily" className="text-xs"><IconRepeat className={`w-3 h-3 ${getRepeatColorClass('Daily')}`} />Daily</SelectItem>
                  <SelectItem value="Weekly" className="text-xs"><IconRepeat className={`w-3 h-3 ${getRepeatColorClass('Weekly')}`} />Weekly</SelectItem>
                  <SelectItem value="Monthly" className="text-xs"><IconRepeat className={`w-3 h-3 ${getRepeatColorClass('Monthly')}`} />Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value as any}))}>
                <SelectTrigger
                  size="sm"
                  className="text-xs px-2 py-0 rounded-sm border-text-muted-foreground text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work" className="text-xs"><IconTagFilled className={`w-3 h-3 ${getCategoryColorClass('Work')}`} />Work</SelectItem>
                  <SelectItem value="Health" className="text-xs"><IconTagFilled className={`w-3 h-3 ${getCategoryColorClass('Health')}`} />Health</SelectItem>
                  <SelectItem value="Personal" className="text-xs"><IconTagFilled className={`w-3 h-3 ${getCategoryColorClass('Personal')}`} />Personal</SelectItem>
                  <SelectItem value="Finance" className="text-xs"><IconTagFilled className={`w-3 h-3 ${getCategoryColorClass('Finance')}`} />Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && editingReminder && (
                <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteReminder(editingReminder.id)}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={saveReminder} disabled={!formData.title.trim()} variant="outline" className="rounded-sm">
                {isEditMode ? "Save" : "Add Reminder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
