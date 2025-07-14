export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Other'

export interface FoodEntry {
  id: number
  name: string
  calories: number
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  quantity: number
  unit: string
  mealType: MealType
  notes?: string | null
  date: string
  timestamp: string
  userId: string
}

export interface DailyNutritionSummary {
  id: number
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface NutritionGoals {
  id: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateFoodEntryData {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  quantity?: number
  unit?: string
  mealType: MealType
  notes?: string
  date?: string
  userId?: string
}

export interface UpdateFoodEntryData {
  name?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  quantity?: number
  unit?: string
  mealType?: MealType
  notes?: string
}

export interface UpdateNutritionGoalsData {
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

export interface FoodRecognitionResult {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  confidence: number
  suggestions?: FoodRecognitionResult[]
}

export interface CalorieTrackingStats {
  todayCalories: number
  todayGoal: number
  weeklyAverage: number
  monthlyProgress: number
  streakDays: number
} 