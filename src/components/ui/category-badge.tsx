'use client'

import { IconTagFilled } from '@tabler/icons-react'
import { getCategoryColorClass, getCategoryConfig, type Category } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline'
  className?: string
}

export function CategoryBadge({
  category,
  size = 'default',
  variant = 'default',
  className,
}: CategoryBadgeProps) {
  if (!category) return null
  
  const config = getCategoryConfig(category)
  
  const baseClasses = "flex items-center gap-1"
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm"
  }
  
  const iconSize = size === 'sm' ? "h-3 w-3" : "h-4 w-4"
  
  return (
    <div className={cn(
      baseClasses,
      sizeClasses[size],
      "text-muted-foreground",
      className
    )}>
      <IconTagFilled
        className={cn(iconSize, "mr-1", config.color)}
      />
      {config.label}
    </div>
  )
} 