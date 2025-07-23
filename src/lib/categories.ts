// Define category values as a tuple for the database enum
export const CATEGORY_VALUES = [
  'Health', 
  'Home',
  'Placement',
  'School',
] as const

export const CATEGORIES = {
  Health: {
    value: 'Health',
    label: 'Health', 
    color: 'text-[#de5550]',
    bgColor: 'bg-[#de5550]',
  },
  Home: {
    value: 'Home',
    label: 'Home',
    color: 'text-[#22c55e]',
    bgColor: 'bg-[#22c55e]',
  },
  Placement: {
    value: 'Placement',
    label: 'Placement',
    color: 'text-[#8b5cf6]',
    bgColor: 'bg-[#8b5cf6]',
  },
  School: {
    value: 'School',
    label: 'School',
    color: 'text-[#f59e0b]',
    bgColor: 'bg-[#f59e0b]',
  },
} as const

// Export type for TypeScript
export type CategoryValue = keyof typeof CATEGORIES
export type Category = CategoryValue | null

// Utility function to get category color class
export const getCategoryColorClass = (category: Category): string => {
  if (!category || !(category in CATEGORIES)) {
    return 'text-muted-foreground'
  }
  return CATEGORIES[category].color
}

// Utility function to get category config
export const getCategoryConfig = (category: Category) => {
  if (!category || !(category in CATEGORIES)) {
    return {
      value: null,
      label: 'None',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    }
  }
  return CATEGORIES[category]
}

// Get all categories as array for dropdowns
export const getAllCategories = () => Object.values(CATEGORIES) 