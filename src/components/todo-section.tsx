'use client'

import { useOptimistic, useTransition, useState, useEffect, useMemo } from 'react'
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
import TextareaAutosize from 'react-textarea-autosize'
import {
  IconPlus,
  IconCalendarFilled,
  IconFlagFilled,
  IconGripVertical,
  IconCircleCheck,
  IconAlarmFilled,
  IconTrash,
  IconFilter,
  IconTagFilled,
  IconX,
} from '@tabler/icons-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategorySelect } from '@/components/ui/category-select'
import { CategoryBadge } from '@/components/ui/category-badge'
import { Todo } from '@/types'
import { formatTime, to24HourFormat } from '@/lib/utils'
import { type Category, getAllCategories } from '@/lib/categories'

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

const REMINDER_OPTIONS: string[] = (() => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      options.push(`${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`)
    }
  }
  return options
})()

export function TodoSection({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    optimisticReducer,
  )
  const [, startTransition] = useTransition()

  const [filters, setFilters] = useState<{
    category: Category | 'all'
    priority: 'High' | 'Medium' | 'Low' | 'all'
  }>({
    category: 'all',
    priority: 'all'
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | null>(null)
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<{
    title: string
    dueDate?: Date
    priority: 'High' | 'Medium' | 'Low'
    category: Category
    reminderTime: string
  }>({
    title: '',
    priority: 'Medium',
    category: null,
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

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingTask(null)
    setFormData({
      title: '',
      priority: 'Medium',
      category: null,
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
      category: task.category || null,
      reminderTime: formatTime(task.reminderTime) || '',
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
        reminderTime: to24HourFormat(formData.reminderTime) || undefined,
        completed: editingTask.completed,
        category: formData.category,
      }
      startTransition(async () => {
        addOptimisticTodo({
          type: 'update',
          todo: updatedTodo as unknown as Todo,
        })
        await updateTodo(editingTask.id, {
          ...formData,
          reminderTime: to24HourFormat(formData.reminderTime) ?? undefined,
        })
      })
    } else {
      const newTodo = {
        id: Date.now(),
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        reminderTime: to24HourFormat(formData.reminderTime) || undefined,
        category: formData.category,
        completed: false,
        completedDate: null,
        userId: '',
        timestamp: new Date().toISOString(),
      }
      startTransition(async () => {
        addOptimisticTodo({ type: 'add', todo: newTodo as Todo })
        await createTodo({
          ...formData,
          reminderTime: to24HourFormat(formData.reminderTime) ?? undefined,
        })
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
      category: null,
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  const applyFilters = (todo: Todo): boolean => {
    if (filters.category !== 'all' && todo.category !== filters.category) {
      return false
    }
    
    if (filters.priority !== 'all' && todo.priority !== filters.priority) {
      return false
    }
    
    return true
  }

  const { todayTodos, upcomingTodos } = useMemo(() => {
    const todayResults: Todo[] = []
    const upcomingResults: Todo[] = []
    
    for (const todo of optimisticTodos) {
      if (!applyFilters(todo)) {
        continue
      }
      
      const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
      const dueTime = dueDate ? dueDate.getTime() : null
      
      if (todo.completed && (!dueTime || dueTime < todayTime)) {
        continue
      }
      
      if (!dueTime || dueTime <= todayTime) {
        todayResults.push({
          ...todo,
          _isOverdue: dueTime ? dueTime < todayTime : false,
          _isDueToday: dueTime === todayTime,
          _sortKey: dueTime ? (dueTime < todayTime ? 0 : 1) : 2
        } as Todo & { _isOverdue: boolean; _isDueToday: boolean; _sortKey: number })
      } else if (dueTime > todayTime) {
        upcomingResults.push(todo)
      }
    }
    
    todayResults.sort((a, b) => (a as any)._sortKey - (b as any)._sortKey)
    
    return {
      todayTodos: todayResults,
      upcomingTodos: upcomingResults
    }
  }, [optimisticTodos, todayTime, filters])
  
  const isOverdue = (todo: Todo) => (todo as any)._isOverdue

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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isOverdue(todo) && (
                <div className="text-destructive flex items-center gap-1 text-xs">
                  <IconCalendarFilled className="mr-1 h-3 w-3" />
                  Overdue
                </div>
              )}
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <IconFlagFilled
                  className={`mr-1 h-3 w-3 ${getPriorityIconColor(
                    todo.priority,
                  )}`}
                />
                {todo.priority}
              </div>
              <CategoryBadge category={todo.category} size="sm" />
              {todo.dueDate && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <IconCalendarFilled className="h-3 w-3" />
                  {new Date(todo.dueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'Asia/Kolkata',
                  })}
                </div>
              )}
              {todo.reminderTime && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <IconAlarmFilled className="h-3 w-3" />
                  {formatTime(todo.reminderTime)}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive transition-opacity md:opacity-0 md:group-hover:opacity-100"
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
          <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">Todo</h1>
          <p className="text-muted-foreground text-lg select-none">
            Manage your tasks and priorities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="!h-10 px-2 sm:px-3 py-2 text-sm"
            variant="outline"
            onClick={() => window.location.href = '/todos/completed'}
          >
            <IconCircleCheck className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">View Completed</span>
          </Button>
          <Button
            className="!h-10 px-2 sm:px-3 py-2 text-sm"
            variant="outline"
            onClick={openCreateModal}
          >
            <IconPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg">
        
        {/* Category Filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            setFilters(prev => ({ 
              ...prev, 
              category: value === 'all' ? 'all' : value as Category 
            }))
          }
        >
          <SelectTrigger className="h-8 text-xs focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:border-border focus-visible:border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
            {getAllCategories().map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-xs">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={category.value} size="sm" variant="outline" />
                  {/* {category.label} */}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            setFilters(prev => ({ ...prev, priority: value as 'High' | 'Medium' | 'Low' | 'all' }))
          }
        >
          <SelectTrigger className="h-8 text-xs focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:border-border focus-visible:border-border">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
            <SelectItem value="High" className="text-xs">
              <div className="flex items-center gap-2">
                <IconFlagFilled className="h-3 w-3 text-[#de5550]" />
                High
              </div>
            </SelectItem>
            <SelectItem value="Medium" className="text-xs">
              <div className="flex items-center gap-2">
                <IconFlagFilled className="h-3 w-3 text-[#ffb110]" />
                Medium
              </div>
            </SelectItem>
            <SelectItem value="Low" className="text-xs">
              <div className="flex items-center gap-2">
                <IconFlagFilled className="h-3 w-3 text-[#2383e2]" />
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {(filters.category !== 'all' || filters.priority !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setFilters({ category: 'all', priority: 'all' })}
          >
            <IconX className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
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
          <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
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
        <DialogContent 
          className="sm:max-w-[500px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <TextareaAutosize
                placeholder={isEditMode ? 'Edit task name' : 'Task name'}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="placeholder-muted-foreground w-full resize-none border-none bg-transparent p-0 !text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 whitespace-normal break-words"
                minRows={1}
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
                disablePastDates={true}
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

              <CategorySelect
                value={formData.category}
                onValueChange={(category) =>
                  setFormData((prev) => ({ ...prev, category }))
                }
                size="sm"
              />

              <div>
                <Select
                  value={formData.reminderTime || 'none'}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, reminderTime: value === 'none' ? '' : value }))
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
                    <SelectItem value="none" className="text-xs">
                      <span className="text-muted-foreground">None</span>
                    </SelectItem>
                    {REMINDER_OPTIONS.map((time) => (
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
