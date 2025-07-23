'use client'

import { useOptimistic, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteTodo,
  toggleTodo,
} from '@/lib/actions/todos'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconArrowLeft,
  IconCalendarFilled,
  IconFlagFilled,
  IconGripVertical,
  IconTagFilled,
  IconCircleCheck,
  IconAlarmFilled,
  IconTrash,
  IconCircleCheckFilled,
} from '@tabler/icons-react'
import { Todo } from '@/types'
import { formatTime } from '@/lib/utils'

type Action =
  | { type: 'delete'; id: number }
  | { type: 'toggle'; id: number }

function optimisticReducer(
  state: Todo[],
  { type, id }: { type: Action['type']; id?: number },
) {
  switch (type) {
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

export function CompletedTodosSection({ todos }: { todos: Todo[] }) {
  const router = useRouter()
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    optimisticReducer,
  )
  const [, startTransition] = useTransition()

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

  // Group completed todos by completion date (most recent first)
  const groupedTodos = useMemo(() => {
    const groups: { [key: string]: Todo[] } = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    optimisticTodos.forEach(todo => {
      let dateKey = 'Unknown Date'
      
      if (todo.completedDate) {
        const completedDate = new Date(todo.completedDate)
        const completedDateOnly = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate())
        
        if (completedDateOnly.getTime() === today.getTime()) {
          dateKey = 'Today'
        } else if (completedDateOnly.getTime() === yesterday.getTime()) {
          dateKey = 'Yesterday'
        } else if (completedDate >= weekAgo) {
          dateKey = 'This Week'
        } else {
          // Format as "Month Day, Year" for older dates
          dateKey = completedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        }
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(todo)
    })
    
    // Sort groups by priority: Today, Yesterday, This Week, then by date
    const sortedGroups: { [key: string]: Todo[] } = {}
    const groupOrder = ['Today', 'Yesterday', 'This Week']
    
    groupOrder.forEach(key => {
      if (groups[key]) {
        sortedGroups[key] = groups[key]
      }
    })
    
    // Add remaining groups sorted by date (newest first)
    Object.keys(groups)
      .filter(key => !groupOrder.includes(key) && key !== 'Unknown Date')
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateB.getTime() - dateA.getTime()
      })
      .forEach(key => {
        sortedGroups[key] = groups[key]
      })
    
    // Add Unknown Date last
    if (groups['Unknown Date']) {
      sortedGroups['Unknown Date'] = groups['Unknown Date']
    }
    
    return sortedGroups
  }, [optimisticTodos])

  const CompletedTodoItem = ({ todo }: { todo: Todo }) => (
    <Card
      className="group bg-card border-none !py-3 transition-colors opacity-75"
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
            <h3 className="text-sm font-medium text-muted-foreground line-through">
              {todo.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {todo.completedDate && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-sm">
                  <IconCircleCheckFilled className="h-3 w-3 text-[#22c55e]" />
                  {new Date(todo.completedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: new Date(todo.completedDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                    timeZone: 'Asia/Kolkata',
                  })}
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/todos')}
            className="h-8 w-8"
          >
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">Completed Todos</h1>
            <p className="text-muted-foreground text-lg select-none">
              View your accomplished tasks
            </p>
          </div>
        </div>
      </div>

      {optimisticTodos.length === 0 ? (
        <div className="text-center py-12">
          <IconCircleCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No completed todos yet</h3>
          <p className="text-muted-foreground">Complete some tasks to see them here!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTodos).map(([dateGroup, todos]) => (
            <div key={dateGroup}>
              <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
                {dateGroup}
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconCircleCheck className="h-3 w-3" />
                  {todos.length} completed tasks
                </div>
              </h2>
              <div className="space-y-2">
                {todos.map((todo) => (
                  <CompletedTodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 