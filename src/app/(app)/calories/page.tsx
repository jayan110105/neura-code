import { type Metadata } from 'next'
import { getFoodEntries, getDailyNutritionSummaryWithGoals, getCalorieTrackingStats } from '@/lib/actions/calories'
import { CaloriesSection } from '@/components/calories-section'
import { formatLocalDate, getCurrentISTDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Track your daily food intake and nutrition. Monitor calories, macronutrients, and achieve your health goals with AI-powered food recognition.',
}

export default async function CaloriesPage() {
  const today = formatLocalDate(getCurrentISTDate())
  
  const [foodEntries, { summary: dailySummary, goals: nutritionGoals }, stats] = await Promise.all([
    getFoodEntries(today),
    getDailyNutritionSummaryWithGoals(today),
    getCalorieTrackingStats(),
  ])

  return (
    <CaloriesSection 
      foodEntries={foodEntries}
      dailySummary={dailySummary}
      nutritionGoals={nutritionGoals}
      stats={stats}
    />
  )
} 