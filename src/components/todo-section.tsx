'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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

type Action =
  | { type: 'add'; todo: Todo }
  | { type: 'update'; todo: Todo }
  | { type: 'delete'; id: number }
  | { type: 'toggle'; id: number }

function optimisticReducer(
  state: Todo[],
  { type, todo, id }: { type: Action['type']; todo?: Todo; id?: number },
) {
  switch (type) {
    case 'add':
      return [...state, todo as Todo]
    case 'update':
      return state.map((t) => (t.id === (todo as Todo).id ? { ...t, ...todo } : t))
    case 'delete':
      return state.filter((t) => t.id !== id)
    case 'toggle':
      return state.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      )
    default:
      return state
  }
}

export function TodoSection({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    optimisticReducer,
  )
  const [isPending, startTransition] = useTransition()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | null>(null)
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<{
    title: string
    dueDate?: Date
    priority: 'High' | 'Medium' | 'Low'
    category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
    reminderTime: string
  }>({
    title: '',
    priority: 'Medium',
    category: 'Work',
    reminderTime: '',
  })

  useEffect(() => {
    const todoId = searchParams.get('id')
    if (todoId) {
      const todoToEdit = todos.find((todo) => todo.id === Number(todoId))
      if (todoToEdit) {
        openEditModal(todoToEdit)
      }
    }
  }, [searchParams, todos])

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
      category: 'Work',
      reminderTime: '',
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
      category: task.category || 'Work',
      reminderTime: task.reminderTime || '',
    })
    setIsCreateModalOpen(true)
  }

  const handleFormSubmit = async () => {
    if (!formData.title.trim()) return

    closeModal()

    if (isEditMode && editingTask) {
      const updatedTodo = {
        id: editingTask.id,
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        reminderTime: formData.reminderTime,
        completed: editingTask.completed,
        category: formData.category,
      }
      startTransition(async () => {
        addOptimisticTodo({
          type: 'update',
          todo: updatedTodo as unknown as Todo,
        })
        await updateTodo(editingTask.id, formData)
      })
    } else {
      const newTodo = {
        id: Date.now(),
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        reminderTime: formData.reminderTime,
        category: formData.category,
        completed: false,
      }
      startTransition(async () => {
        addOptimisticTodo({ type: 'add', todo: newTodo as unknown as Todo })
        await createTodo(formData)
      })
    }
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setIsEditMode(false)
    setEditingTask(null)
    setFormData({
      title: '',
      priority: 'Medium',
      category: 'Work',
      reminderTime: '',
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

  const todayTodos = optimisticTodos.filter(
    (todo) =>
      todo.dueDate &&
      new Date(todo.dueDate).toDateString() === new Date().toDateString(),
  )
  const upcomingTodos = optimisticTodos.filter(
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
            onCheckedChange={async () => {
              startTransition(async () => {
                addOptimisticTodo({ type: 'toggle', id: todo.id })
                await toggleTodo(todo.id, todo.completed)
              })
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
              {todo.category && (
                <div className="border-border text-muted-foreground flex items-center gap-1 text-xs">
                  <IconTagFilled
                    className={`mr-1 h-3 w-3 ${getCategoryColorClass(
                      todo.category,
                    )}`}
                  />
                  {todo.category}
                </div>
              )}
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
              {todo.reminderTime && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <IconAlarmFilled className="h-3 w-3" />
                  {todo.reminderTime}
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
              startTransition(async () => {
                addOptimisticTodo({ type: 'delete', id: todo.id })
                await deleteTodo(todo.id)
              })
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

              <Select
                value={formData.category || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as any,
                  }))
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
                      className={`h-3 w-3 ${getCategoryColorClass(
                        'Personal',
                      )}`}
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

              <div>
                <Select
                  value={formData.reminderTime}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, reminderTime: value }))
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  >
                    <IconAlarmFilled className="h-3 w-3" />
                    <SelectValue placeholder="00:00" />
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
