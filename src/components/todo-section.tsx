"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { IconPlus, IconCalendarFilled, IconFlagFilled, IconGripVertical, IconTagFilled, IconCircleCheck, IconChevronDown, IconBellFilled, IconAlarmFilled } from "@tabler/icons-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockTodos = {
  today: [
    {
      id: 1,
      title: "Review design mockups for mobile app",
      completed: false,
      priority: "High",
      dueDate: "2024-01-15",
      category: "Work",
    },
    {
      id: 2,
      title: "Call dentist to schedule appointment",
      completed: true,
      priority: "Medium",
      dueDate: "2024-01-15",
      category: "Personal",
    },
  ],
  upcoming: [
    {
      id: 3,
      title: "Prepare presentation for client meeting",
      completed: false,
      priority: "High",
      dueDate: "2024-01-17",
      category: "Work",
    },
    {
      id: 4,
      title: "Buy groceries for the week",
      completed: false,
      priority: "Low",
      dueDate: "2024-01-16",
      category: "Personal",
    },
  ],
  completed: [
    {
      id: 5,
      title: "Update portfolio website",
      completed: true,
      priority: "Medium",
      dueDate: "2024-01-14",
      category: "Work",
    },
  ],
}

export function TodoSection() {
  const [todos, setTodos] = useState(mockTodos)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [formData, setFormData] = useState<{
    title: string;
    dueDate?: Date;
    priority: "High" | "Medium" | "Low";
    reminder: string;
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
        const ampm = hour < 12 ? 'AM' : 'PM'
        const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
        options.push(timeString)
      }
    }
    return options
  }

  const reminderOptions = generateReminderOptions()

  const toggleTodo = (id: number, section: keyof typeof mockTodos) => {
    setTodos((prev) => ({
      ...prev,
      [section]: prev[section].map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    }))
  }

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

  const openEditModal = (task: any) => {
    setEditingTask(task)
    setIsEditMode(true)
    setFormData({
      title: task.title,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      priority: task.priority,
      reminder: "",
    })
    setIsCreateModalOpen(true)
  }

  const createTodo = () => {
    if (!formData.title.trim()) return

    if (isEditMode && editingTask) {
      // Update existing task
      const updatedTask = {
        ...editingTask,
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd") : editingTask.dueDate,
      }

      setTodos(prev => {
        const newTodos = { ...prev }
        // Find which section the task is in and update it
        for (const [sectionKey, sectionTasks] of Object.entries(newTodos)) {
          const taskIndex = sectionTasks.findIndex((t: any) => t.id === editingTask.id)
          if (taskIndex !== -1) {
            newTodos[sectionKey as keyof typeof mockTodos][taskIndex] = updatedTask
            break
          }
        }
        return newTodos
      })
    } else {
      // Create new task
      const newTodo = {
        id: Date.now(),
        title: formData.title,
        completed: false,
        priority: formData.priority,
        dueDate: formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd") : new Date(Date.now() + 86400000).toISOString().split('T')[0],
        category: "Personal"
      }

      const targetSection = formData.dueDate && new Date(formData.dueDate).toDateString() === new Date().toDateString() ? "today" : "upcoming"
      
      setTodos(prev => ({
        ...prev,
        [targetSection]: [...prev[targetSection], newTodo]
      }))
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

  const getPriorityIconColor = (priority: string) => {
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

  const TodoItem = ({ todo, section }: { todo: any; section: keyof typeof mockTodos }) => (
    <Card className="bg-card border-none hover:bg-card/80 transition-colors cursor-pointer" onClick={() => openEditModal(todo)}>
      <CardContent>
        <div className="flex gap-3">
          <IconGripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => toggleTodo(todo.id, section)}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full w-5 h-5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground cursor-pointer"
          />
          <div className="flex-1">
            <h3
              className={`font-medium text-sm ${
                todo.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {todo.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <IconFlagFilled className={`w-3 h-3 mr-1 ${getPriorityIconColor(todo.priority)}`} />
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
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Todo</h1>
          <p className="text-muted-foreground text-lg">Manage your tasks and priorities</p>
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
              {todos.today.length} tasks
            </div>
          </h2>
          <div className="space-y-2">
            {todos.today.map((todo) => (
              <TodoItem key={todo.id} todo={todo} section="today" />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-foreground mb-4 flex flex-col gap-2">
            Upcoming
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCircleCheck className="w-3 h-3" />
              {todos.upcoming.length} tasks
            </div>
          </h2>
          <div className="space-y-2">
            {todos.upcoming.map((todo) => (
              <TodoItem key={todo.id} todo={todo} section="upcoming" />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-foreground mb-4 flex flex-col gap-2">
            Completed
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCircleCheck className="w-3 h-3" />
              {todos.completed.length} tasks
            </div>
          </h2>
          <div className="space-y-2">
            {todos.completed.map((todo) => (
              <TodoItem key={todo.id} todo={todo} section="completed" />
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
                onDateChange={(date: Date | undefined) => setFormData(prev => ({ ...prev, dueDate: date }))}
                placeholder="Pick a date"
                showLabel={false}
              />
              
              <Select 
                value={formData.priority} 
                onValueChange={(value: "High" | "Medium" | "Low") => setFormData(prev => ({...prev, priority: value}))}
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
              onClick={createTodo}
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
