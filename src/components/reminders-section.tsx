'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  createReminder,
  deleteReminder,
  toggleReminder,
  updateReminder,
} from '@/lib/actions/reminders'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconPlus,
  IconCalendarFilled,
  IconAlarmFilled,
  IconRepeat,
  IconTrash,
  IconTagFilled,
} from '@tabler/icons-react'
import TextareaAutosize from 'react-textarea-autosize'
import { Reminder } from '@/types'
import { formatTime } from '@/lib/utils'

type ReminderForm = {
  title: string
  description: string
  time: string
  date?: Date
  repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}

type Action =
  | { type: 'add'; reminder: Reminder }
  | { type: 'update'; reminder: Reminder }
  | { type: 'delete'; id: number }
  | { type: 'toggle'; id: number }

function optimisticReducer(
  state: Reminder[],
  {
    type,
    reminder,
    id,
  }: { type: Action['type']; reminder?: Reminder; id?: number },
) {
  switch (type) {
    case 'add':
      return [reminder as Reminder, ...state]
    case 'update':
      return state.map((r) =>
        r.id === (reminder as Reminder).id ? { ...r, ...reminder } : r,
      )
    case 'delete':
      return state.filter((r) => r.id !== id)
    case 'toggle':
      return state.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    default:
      return state
  }
}

export function RemindersSection({ reminders }: { reminders: Reminder[] }) {
  const [optimisticReminders, addOptimisticReminder] = useOptimistic(
    reminders,
    optimisticReducer,
  )
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<ReminderForm>({
    title: '',
    description: '',
    time: '9:00 AM',
    repeat: 'Daily',
    category: 'Work',
  })

  useEffect(() => {
    const reminderId = searchParams.get('id')
    if (reminderId) {
      const reminderToEdit = reminders.find(
        (reminder) => reminder.id === Number(reminderId),
      )
      if (reminderToEdit) {
        openEditModal(reminderToEdit)
      }
    }
  }, [searchParams, reminders])

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
      title: '',
      description: '',
      time: '9:00 AM',
      repeat: 'Daily',
      category: 'Work',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      time: reminder.time ? formatTime(reminder.time) : '9:00 AM',
      date: reminder.date ? new Date(reminder.date) : undefined,
      repeat: reminder.repeat,
      category: reminder.category,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReminder(null)
  }

  const to24HourFormat = (time: string | null): string | null => {
    if (!time) return null
    const [hourMinute, period] = time.split(' ')
    let [hour, minute] = hourMinute.split(':').map(Number)
    if (period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  }

  const handleSaveReminder = async () => {
    if (!formData.title.trim()) return

    closeModal()

    const dataToSave = {
      ...formData,
      time: to24HourFormat(formData.time),
      date: formData.date || null,
    }

    if (editingReminder) {
      const updatedReminder = {
        ...editingReminder,
        ...dataToSave,
      }
      startTransition(async () => {
        addOptimisticReminder({ type: 'update', reminder: updatedReminder as Reminder })
        await updateReminder(editingReminder.id, dataToSave)
      })
    } else {
      const newReminder = {
        id: Date.now(),
        ...dataToSave,
        userId: '',
        enabled: true,
        timestamp: new Date().toISOString(),
      }
      startTransition(async () => {
        addOptimisticReminder({ type: 'add', reminder: newReminder as unknown as Reminder })
        await createReminder(dataToSave)
      })
    }
  }

  const handleDeleteReminder = async (id: number) => {
    startTransition(async () => {
      addOptimisticReminder({ type: 'delete', id })
      await deleteReminder(id)
      closeModal()
    })
  }

  const handleToggleReminder = (id: number, enabled: boolean) => {
    startTransition(async () => {
      addOptimisticReminder({ type: 'toggle', id })
      await toggleReminder(id, enabled)
    })
  }

  const getRepeatColorClass = (
    repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null,
  ) => {
    switch (repeat) {
      case 'Daily':
        return 'text-[#2383e2]'
      case 'Weekly':
        return 'text-[#22c55e]'
      case 'Monthly':
        return 'text-[#a855f7]'
      default:
        return 'text-muted-foreground'
    }
  }

  const getCategoryColorClass = (
    category: 'Work' | 'Health' | 'Personal' | 'Finance' | null,
  ) => {
    switch (category) {
      case 'Work':
        return 'text-[#ffb110]'
      case 'Health':
        return 'text-[#de5550]'
      case 'Personal':
        return 'text-[#22c55e]'
      case 'Finance':
        return 'text-[#2383e2]'
      default:
        return 'text-muted-foreground'
    }
  }

  const isEditMode = Boolean(editingReminder)

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold">
            Reminders
          </h1>
          <p className="text-muted-foreground text-lg">
            Never miss important tasks and events
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm"
          variant="outline"
          onClick={openCreateModal}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {optimisticReminders.length > 0 ? (
          optimisticReminders.map((reminder) => {
            return (
              <Card
                key={reminder.id}
                className="bg-card border-border hover:bg-card/80 group cursor-pointer transition-colors gap-2"
                onClick={() => openEditModal(reminder)}
              >
                <CardHeader className="px-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-foreground mb-2 text-lg font-medium">
                        {reminder.title}
                      </h3>
                      <p className="text-muted-foreground mb-2 text-sm">
                        {reminder.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-auto p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteReminder(reminder.id)
                        }}
                      >
                        <IconTrash className="h-3 w-3" />
                      </Button>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() =>
                          handleToggleReminder(reminder.id, reminder.enabled)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <IconCalendarFilled className="h-3 w-3" />
                      <span>
                        {reminder.date &&
                          new Date(reminder.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <IconAlarmFilled className="h-3 w-3" />
                      <span>{formatTime(reminder.time)}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <IconRepeat
                        className={`h-3 w-3 ${getRepeatColorClass(reminder.repeat)}`}
                      />
                      {reminder.repeat}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <IconTagFilled
                        className={`h-3 w-3 ${getCategoryColorClass(reminder.category)}`}
                      />
                      {reminder.category}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <h3 className="text-xl font-semibold tracking-tight">
              No reminders found
            </h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              You haven&apos;t set any reminders yet.
            </p>
            <Button variant="outline" onClick={openCreateModal}>
              <IconPlus className="mr-2 h-4 w-4" />
              New Reminder
            </Button>
          </div>
        )}
      </div>

      {/* Modal for create & edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-none sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="border-none !pl-0 !text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <TextareaAutosize
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="placeholder:text-muted-foreground flex w-full resize-none rounded-md border-none bg-transparent px-3 py-2 !pl-0 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              minRows={1}
            />
            <div className="flex flex-wrap gap-2">
              <DatePicker
                selectedDate={formData.date}
                onDateChange={(date) =>
                  setFormData((prev) => ({ ...prev, date: date }))
                }
              />
              <Select
                value={formData.time}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, time: value }))
                }
              >
                <SelectTrigger
                  size="sm"
                  className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <IconAlarmFilled className="text-muted-foreground h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time} className="text-xs">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.repeat || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, repeat: value as any }))
                }
              >
                <SelectTrigger
                  size="sm"
                  className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <SelectValue placeholder="Repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None" className="text-xs">
                    None
                  </SelectItem>
                  <SelectItem value="Daily" className="text-xs">
                    <IconRepeat
                      className={`h-3 w-3 ${getRepeatColorClass('Daily')}`}
                    />
                    Daily
                  </SelectItem>
                  <SelectItem value="Weekly" className="text-xs">
                    <IconRepeat
                      className={`h-3 w-3 ${getRepeatColorClass('Weekly')}`}
                    />
                    Weekly
                  </SelectItem>
                  <SelectItem value="Monthly" className="text-xs">
                    <IconRepeat
                      className={`h-3 w-3 ${getRepeatColorClass('Monthly')}`}
                    />
                    Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.category || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as any }))
                }
              >
                <SelectTrigger
                  size="sm"
                  className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work" className="text-xs">
                    <IconTagFilled
                      className={`h-3 w-3 ${getCategoryColorClass('Work')}`}
                    />
                    Work
                  </SelectItem>
                  <SelectItem value="Health" className="text-xs">
                    <IconTagFilled
                      className={`h-3 w-3 ${getCategoryColorClass('Health')}`}
                    />
                    Health
                  </SelectItem>
                  <SelectItem value="Personal" className="text-xs">
                    <IconTagFilled
                      className={`h-3 w-3 ${getCategoryColorClass('Personal')}`}
                    />
                    Personal
                  </SelectItem>
                  <SelectItem value="Finance" className="text-xs">
                    <IconTagFilled
                      className={`h-3 w-3 ${getCategoryColorClass('Finance')}`}
                    />
                    Finance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              {isEditMode && editingReminder && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteReminder(editingReminder.id)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveReminder}
                disabled={!formData.title.trim()}
                variant="outline"
              >
                {isEditMode ? 'Save' : 'Add reminder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
