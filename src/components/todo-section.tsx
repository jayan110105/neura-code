"use client"

import { useState } from "react"
import {
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "@/lib/actions/todos"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
} from "@tabler/icons-react"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Todo } from "@/types"

export function TodoSection({ todos }: { todos: Todo[] }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    dueDate?: Date
    priority: "High" | "Medium" | "Low"
    reminder: string
  }>({
    title: "",
    priority: "Medium",
    reminder: "",
  })

  const generateReminderOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? "AM" : "PM"
        const timeString = `${hour12}:${minute
          .toString()
          .padStart(2, "0")} ${ampm}`
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
      title: "",
      priority: "Medium",
      reminder: "",
    })
    setIsCreateModalOpen(true)
  }

  const openEditModal = (task: Todo) => {
    setEditingTask(task)
    setIsEditMode(true)
    setFormData({
      title: task.title,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      priority: task.priority || "Medium",
      reminder: "",
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
      title: "",
      priority: "Medium",
      reminder: "",
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
      title: "",
      priority: "Medium",
      reminder: "",
    })
  }

  const getPriorityIconColor = (priority: string | null) => {
    switch (priority) {
      case "High":
        return "text-[#de5550]"
      case "Medium":
        return "text-[#ffb110]"
      case "Low":
        return "text-[#2383e2]"
      default:
        return "text-muted-foreground"
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
      className="!py-3 group bg-card border-none hover:bg-card/80 transition-colors cursor-pointer"
      onClick={() => openEditModal(todo)}
    >
      <CardContent>
        <div className="flex gap-3 items-center">
          <IconGripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <Checkbox
            checked={todo.completed}
            onCheckedChange={async (checked) => {
              await toggleTodo(todo.id, todo.completed)
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full w-5 h-5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground cursor-pointer"
          />
          <div className="flex-1">
            <h3
              className={`font-medium text-sm ${
                todo.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {todo.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <IconFlagFilled
                  className={`w-3 h-3 mr-1 ${getPriorityIconColor(
                    todo.priority,
                  )}`}
                />
                {todo.priority}
              </div>
              <div className="flex items-center gap-1 border-border text-muted-foreground text-xs">
                <IconTagFilled className="w-3 h-3 mr-1" />
                {todo.category}
              </div>
              {todo.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconCalendarFilled className="w-3 h-3" />
                  {new Date(todo.dueDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              deleteTodo(todo.id)
            }}
          >
            <IconTrash className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Todo</h1>
          <p className="text-muted-foreground text-lg">
            Manage your tasks and priorities
          </p>
        </div>
        <Button
          className="text-sm !h-10 py-2 px-3"
          variant="outline"
          onClick={openCreateModal}
        >
          <IconPlus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-medium text-foreground mb-4 flex flex-col gap-2">
            Today
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCircleCheck className="w-3 h-3" />
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
          <h2 className="font-medium text-foreground mb-4 flex flex-col gap-2">
            Upcoming
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCircleCheck className="w-3 h-3" />
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
                placeholder={isEditMode ? "Edit task name" : "Task name"}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-transparent border-none !text-lg placeholder-muted-foreground p-0 h-auto focus-visible:ring-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex gap-2 flex-wrap">

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
                    priority: value as "High" | "Medium" | "Low",
                  })
                }
              >
                <SelectTrigger 
                  size="sm"
                  className="text-xs px-2 py-0 rounded-sm border-text-muted-foreground text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none"
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High" className="text-xs">
                    <IconFlagFilled className="w-3 h-3 text-[#de5550]" />
                    High
                  </SelectItem>
                  <SelectItem value="Medium" className="text-xs">
                    <IconFlagFilled className="w-3 h-3 text-[#ffb110]" />
                    Medium
                  </SelectItem>
                  <SelectItem value="Low" className="text-xs">
                    <IconFlagFilled className="w-3 h-3 text-[#2383e2]" />
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div>
                <Select 
                  value={formData.reminder} 
                  onValueChange={(value: string) => setFormData(prev => ({...prev, reminder: value}))}
                >
                  <SelectTrigger 
                    size="sm"
                    className="text-xs px-2 py-0 rounded-sm border-text-muted-foreground text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none"
                  >
                    <IconAlarmFilled className="w-3 h-3" />
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
            <Button
              variant="ghost"
              onClick={closeModal}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleFormSubmit}
              disabled={!formData.title.trim()}
              variant="outline"
            >
              {isEditMode ? "Save" : "Add task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
