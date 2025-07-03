'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleTodo } from '@/lib/actions/todos'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconFlagFilled,
  IconTagFilled,
  IconCalendarFilled,
  IconAlarmFilled,
} from '@tabler/icons-react'
import { Todo } from '@/types'

interface TodosListProps {
  todos: Todo[]
  onTodoClick?: (todo: Todo) => void
}

function optimisticReducer(
  state: Todo[],
  { id }: { id: number },
) {
  return state.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
}

export function TodosList({ todos, onTodoClick }: TodosListProps) {
  const [optimisticTodos, toggleOptimisticTodo] = useOptimistic(
    todos,
    optimisticReducer,
  )
  const [isPending, startTransition] = useTransition()

  if (optimisticTodos.length === 0) return null

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

  const handleTodoClick = (todo: Todo) => {
    if (onTodoClick) {
      onTodoClick(todo)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-foreground mb-4 flex flex-col gap-2 text-xl font-medium">
        Todos
      </h2>
      <Card className="bg-card border-none">
        <CardContent className="px-4">
          <div className="space-y-2">
            {optimisticTodos.map((todo) => (
              <div
                key={todo.id}
                className="hover:bg-muted/50 flex cursor-pointer gap-3 rounded-md p-2 transition-colors"
                onClick={() => handleTodoClick(todo)}
              >
                <Checkbox
                  checked={todo.completed || false}
                  onCheckedChange={() => {
                    startTransition(async () => {
                      toggleOptimisticTodo({ id: todo.id })
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
                    {todo.priority && (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <IconFlagFilled
                          className={`mr-1 h-3 w-3 ${getPriorityIconColor(
                            todo.priority,
                          )}`}
                        />
                        {todo.priority}
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
