'use client'

import { IconTagFilled } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllCategories, getCategoryColorClass, type Category } from '@/lib/categories'

interface CategorySelectProps {
  value: Category
  onValueChange: (value: Category) => void
  placeholder?: string
  size?: 'sm' | 'default'
  includeNone?: boolean
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = 'Category',
  size = 'default',
  includeNone = true,
}: CategorySelectProps) {
  const categories = getAllCategories()
  
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue === 'none' ? null : newValue as Category)
  }

  const triggerClassName = size === 'sm' 
    ? "border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
    : ""

  return (
    <Select
      value={value || 'none'}
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        size={size}
        className={triggerClassName}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeNone && (
          <SelectItem value="none" className="text-xs">
            <IconTagFilled className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">None</span>
          </SelectItem>
        )}
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value} className="text-xs">
            <IconTagFilled
              className={`h-3 w-3 ${getCategoryColorClass(category.value)}`}
            />
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 