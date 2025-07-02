"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { IconFlagFilled, IconTagFilled, IconCalendarFilled } from "@tabler/icons-react"
import { Todo } from "@/data/todos"

interface TodosListProps {
  todos: Todo[]
  onTodoClick?: (todo: Todo) => void
  onTodoToggle?: (todoId: number) => void
}

export function TodosList({ todos, onTodoClick, onTodoToggle }: TodosListProps) {
  if (todos.length === 0) return null

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

  const handleTodoClick = (todo: Todo) => {
    if (onTodoClick) {
      onTodoClick(todo)
    }
  }

  const handleToggle = (todoId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onTodoToggle) {
      onTodoToggle(todoId)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-foreground mb-4 flex flex-col gap-2">
        Todos
      </h2>
      <Card className="bg-card border-none">
        <CardContent className="px-4">
          <div className="space-y-2">
            {todos.map((todo) => (
              <div 
                key={todo.id} 
                className="flex gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" 
                onClick={() => handleTodoClick(todo)}
              >
                <Checkbox
                  checked={todo.completed || false}
                  onCheckedChange={() => {}}
                  onClick={(e) => handleToggle(todo.id, e)}
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
                    {todo.priority && (
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <IconFlagFilled className={`w-3 h-3 mr-1 ${getPriorityIconColor(todo.priority)}`} />
                        {todo.priority}
                      </div>
                    )}
                    {todo.category && (
                      <div className="flex items-center gap-1 border-border text-muted-foreground text-xs">
                        <IconTagFilled className="w-3 h-3 mr-1" />
                        {todo.category}
                      </div>
                    )}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 