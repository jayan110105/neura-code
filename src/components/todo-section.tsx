'use client'

import { useState } from 'react'
import {
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from '@/lib/actions/todos'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  IconPlus,
  IconCalendarFilled,
  IconFlagFilled,
  IconGripVertical,
  IconTagFilled,
  IconCircleCheck,
  IconChevronDown,
  IconBellFilled,
  IconAlarmFilled,
  IconTrash,
} from '@tabler/icons-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Todo } from '@/types'

export function TodoSection({ todos }: { todos: Todo[] }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    dueDate?: Date
    priority: 'High' | 'Medium' | 'Low'
    reminder: string
  }>({
    title: '',
    priority: 'Medium',
    reminder: '',
  })

  const generateReminderOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const timeString = `${hour12}:${minute
          .toString()
          .padStart(2, '0')} ${ampm}`
        options.push(timeString)
      }
    }
    return options
  }

  const reminderOptions = generateReminderOptions()

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingTask(null)
    setFormData({
      title: '',
      priority: 'Medium',
      reminder: '',
    })
    setIsCreateModalOpen(true)
  }

  const openEditModal = (task: Todo) => {
    setEditingTask(task)
    setIsEditMode(true)
    setFormData({
      title: task.title,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      priority: task.priority || 'Medium',
      reminder: '',
    })
    setIsCreateModalOpen(true)
  }

  const handleFormSubmit = async () => {
    if (!formData.title.trim()) return

    if (isEditMode && editingTask) {
      await updateTodo(editingTask.id, {
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
      })
    } else {
      await createTodo({
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
      })
    }

    // Reset form
    setFormData({
      title: '',
      priority: 'Medium',
      reminder: '',
    })
    setIsCreateModalOpen(false)
    setIsEditMode(false)
    setEditingTask(null)
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setIsEditMode(false)
    setEditingTask(null)
    setFormData({
      title: '',
      priority: 'Medium',
      reminder: '',
    })
  }

  const getPriorityIconColor = (priority: string | null) => {
    switch (priority) {
      case 'High':
        return 'text-[#de5550]'
      case 'Medium':
        return 'text-[#ffb110]'
      case 'Low':
        return 'text-[#2383e2]'
      default:
        return 'text-muted-foreground'
    }
  }

  const todayTodos = todos.filter(
    (todo) =>
      todo.dueDate &&
      new Date(todo.dueDate).toDateString() === new Date().toDateString(),
  )
  const upcomingTodos = todos.filter(
    (todo) =>
      !todo.dueDate ||
      new Date(todo.dueDate).toDateString() !== new Date().toDateString(),
  )

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <Card
      className="group bg-card hover:bg-card/80 cursor-pointer border-none !py-3 transition-colors"
      onClick={() => openEditModal(todo)}
    >
      <CardContent>
        <div className="flex items-center gap-3">
          <IconGripVertical className="text-muted-foreground h-4 w-4 cursor-grab" />
          <Checkbox
            checked={todo.completed}
            onCheckedChange={async (checked) => {
              await toggleTodo(todo.id, todo.completed)
            }}
            onClick={(e) => e.stopPropagation()}
            className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground h-5 w-5 cursor-pointer rounded-full"
          />
          <div className="flex-1">
            <h3
              className={`text-sm font-medium ${
                todo.completed
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {todo.title}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <IconFlagFilled
                  className={`mr-1 h-3 w-3 ${getPriorityIconColor(
                    todo.priority,
                  )}`}
                />
                {todo.priority}
              </div>
              <div className="border-border text-muted-foreground flex items-center gap-1 text-xs">
                <IconTagFilled className="mr-1 h-3 w-3" />
                {todo.category}
              </div>
              {todo.dueDate && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <IconCalendarFilled className="h-3 w-3" />
                  {new Date(todo.dueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              deleteTodo(todo.id)
            }}
          >
            <IconTrash className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold">Todo</h1>
          <p className="text-muted-foreground text-lg">
            Manage your tasks and priorities
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm"
          variant="outline"
          onClick={openCreateModal}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium">
            Today
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <IconCircleCheck className="h-3 w-3" />
              {todayTodos.length} tasks
            </div>
          </h2>
          <div className="space-y-2">
            {todayTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium">
            Upcoming
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <IconCircleCheck className="h-3 w-3" />
              {upcomingTodos.length} tasks
            </div>
          </h2>
          <div className="space-y-2">
            {upcomingTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      </div>

      {/* Create Todo Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder={isEditMode ? 'Edit task name' : 'Task name'}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="placeholder-muted-foreground h-auto border-none bg-transparent p-0 !text-lg focus-visible:ring-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <DatePicker
                selectedDate={formData.dueDate}
                onDateChange={(date) =>
                  setFormData({ ...formData, dueDate: date })
                }
                placeholder="Pick a date"
                showLabel={false}
              />
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as 'High' | 'Medium' | 'Low',
                  })
                }
              >
                <SelectTrigger
                  size="sm"
                  className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High" className="text-xs">
                    <IconFlagFilled className="h-3 w-3 text-[#de5550]" />
                    High
                  </SelectItem>
                  <SelectItem value="Medium" className="text-xs">
                    <IconFlagFilled className="h-3 w-3 text-[#ffb110]" />
                    Medium
                  </SelectItem>
                  <SelectItem value="Low" className="text-xs">
                    <IconFlagFilled className="h-3 w-3 text-[#2383e2]" />
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>

              <div>
                <Select
                  value={formData.reminder}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, reminder: value }))
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  >
                    <IconAlarmFilled className="h-3 w-3" />
                    <SelectValue placeholder="Reminders" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {reminderOptions.map((time) => (
                      <SelectItem key={time} value={time} className="text-xs">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>

            <Button
              onClick={handleFormSubmit}
              disabled={!formData.title.trim()}
              variant="outline"
            >
              {isEditMode ? 'Save' : 'Add task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
