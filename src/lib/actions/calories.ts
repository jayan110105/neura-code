'use server'

import { db } from '@/db'
import { foodEntries, dailyNutritionSummaries, nutritionGoals } from '@/db/schema'
import { eq, and, desc, gte, lte, sum, sql } from 'drizzle-orm'
import { getCachedSession } from '@/lib/session'
import { formatLocalDate, getCurrentISTDate } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import {
  CreateFoodEntryData,
  UpdateFoodEntryData,
  FoodEntry,
  DailyNutritionSummary,
  NutritionGoals,
  UpdateNutritionGoalsData,
  MealType,
  CalorieTrackingStats,
} from '@/types'

export async function createFoodEntry(data: CreateFoodEntryData): Promise<FoodEntry> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const entryDate = data.date || formatLocalDate(getCurrentISTDate())

  const [foodEntry] = await db
    .insert(foodEntries)
    .values({
      name: data.name,
      calories: data.calories,
      protein: data.protein || null,
      carbs: data.carbs || null,
      fat: data.fat || null,
      quantity: data.quantity || 1,
      unit: data.unit || 'serving',
      mealType: data.mealType,
      notes: data.notes || null,
      date: entryDate,
      userId: session.user.id,
    })
    .returning()

  // Update daily nutrition summary
  await updateDailyNutritionSummary(session.user.id, entryDate)

  revalidatePath('/calories')
  revalidatePath('/today')

  return {
    ...foodEntry,
    timestamp: foodEntry.timestamp.toISOString(),
  }
}

export async function updateFoodEntry(
  id: number,
  data: UpdateFoodEntryData,
): Promise<FoodEntry> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const [existingEntry] = await db
    .select()
    .from(foodEntries)
    .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id)))

  if (!existingEntry) {
    throw new Error('Food entry not found')
  }

  const [updatedEntry] = await db
    .update(foodEntries)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.calories !== undefined && { calories: data.calories }),
      ...(data.protein !== undefined && { protein: data.protein }),
      ...(data.carbs !== undefined && { carbs: data.carbs }),
      ...(data.fat !== undefined && { fat: data.fat }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.mealType !== undefined && { mealType: data.mealType }),
      ...(data.notes !== undefined && { notes: data.notes }),
    })
    .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id)))
    .returning()

  // Update daily nutrition summary
  await updateDailyNutritionSummary(session.user.id, existingEntry.date)

  revalidatePath('/calories')
  revalidatePath('/today')

  return {
    ...updatedEntry,
    timestamp: updatedEntry.timestamp.toISOString(),
  }
}

export async function deleteFoodEntry(id: number): Promise<void> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const [existingEntry] = await db
    .select()
    .from(foodEntries)
    .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id)))

  if (!existingEntry) {
    throw new Error('Food entry not found')
  }

  await db
    .delete(foodEntries)
    .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id)))

  // Update daily nutrition summary
  await updateDailyNutritionSummary(session.user.id, existingEntry.date)

  revalidatePath('/calories')
  revalidatePath('/today')
}

export async function getFoodEntries(date?: string): Promise<FoodEntry[]> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const queryDate = date || formatLocalDate(getCurrentISTDate())

  const entries = await db
    .select()
    .from(foodEntries)
    .where(and(eq(foodEntries.userId, session.user.id), eq(foodEntries.date, queryDate)))
    .orderBy(desc(foodEntries.timestamp))

  return entries.map((entry) => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }))
}

export async function getFoodEntriesByDateRange(
  startDate: string,
  endDate: string,
): Promise<FoodEntry[]> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const entries = await db
    .select()
    .from(foodEntries)
    .where(
      and(
        eq(foodEntries.userId, session.user.id),
        gte(foodEntries.date, startDate),
        lte(foodEntries.date, endDate),
      ),
    )
    .orderBy(desc(foodEntries.timestamp))

  return entries.map((entry) => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }))
}

export async function getDailyNutritionSummary(date?: string): Promise<DailyNutritionSummary | null> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const queryDate = date || formatLocalDate(getCurrentISTDate())

  const [summary] = await db
    .select()
    .from(dailyNutritionSummaries)
    .where(
      and(
        eq(dailyNutritionSummaries.userId, session.user.id),
        eq(dailyNutritionSummaries.date, queryDate),
      ),
    )

  if (!summary) {
    return null
  }

  return {
    ...summary,
    createdAt: summary.createdAt.toISOString(),
    updatedAt: summary.updatedAt.toISOString(),
  }
}

export async function getDailyNutritionSummaryWithGoals(date?: string): Promise<{
  summary: DailyNutritionSummary | null
  goals: NutritionGoals
}> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const [summary, goals] = await Promise.all([
    getDailyNutritionSummary(date),
    getNutritionGoals(),
  ])

  return { summary, goals }
}

export async function getNutritionGoals(): Promise<NutritionGoals> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const [existingGoals] = await db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.userId, session.user.id))

  if (existingGoals) {
    return {
      ...existingGoals,
      createdAt: existingGoals.createdAt.toISOString(),
      updatedAt: existingGoals.updatedAt.toISOString(),
    }
  }

  // Create default goals if none exist
  const [newGoals] = await db
    .insert(nutritionGoals)
    .values({
      userId: session.user.id,
    })
    .returning()

  return {
    ...newGoals,
    createdAt: newGoals.createdAt.toISOString(),
    updatedAt: newGoals.updatedAt.toISOString(),
  }
}

export async function updateNutritionGoals(
  data: UpdateNutritionGoalsData
): Promise<NutritionGoals> {
  const session = await getCachedSession();
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const [existingGoals] = await db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.userId, session.user.id));

  let updatedGoals: NutritionGoals;

  if (existingGoals) {
    const [result] = await db
      .update(nutritionGoals)
      .set({
        calorieGoal: data.calorieGoal,
        proteinGoal: data.proteinGoal,
        carbsGoal: data.carbsGoal,
        fatGoal: data.fatGoal,
        updatedAt: new Date(),
      })
      .where(eq(nutritionGoals.userId, session.user.id))
      .returning();
    updatedGoals = {
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  } else {
    const [result] = await db
      .insert(nutritionGoals)
      .values({
        userId: session.user.id,
        calorieGoal: data.calorieGoal,
        proteinGoal: data.proteinGoal,
        carbsGoal: data.carbsGoal,
        fatGoal: data.fatGoal,
      })
      .returning();
    updatedGoals = {
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  revalidatePath('/calories');
  revalidatePath('/today');

  return updatedGoals;
}

export async function getCalorieTrackingStats(): Promise<CalorieTrackingStats> {
  const session = await getCachedSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }

  const today = formatLocalDate(getCurrentISTDate())
  const todaySummary = await getDailyNutritionSummary(today)
  const goals = await getNutritionGoals()

  // Calculate weekly average
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoDate = formatLocalDate(weekAgo)

  const weeklyEntries = await db
    .select({
      totalCalories: sum(foodEntries.calories),
      date: foodEntries.date,
    })
    .from(foodEntries)
    .where(
      and(
        eq(foodEntries.userId, session.user.id),
        gte(foodEntries.date, weekAgoDate),
        lte(foodEntries.date, today),
      ),
    )
    .groupBy(foodEntries.date)

  const weeklyAverage =
    weeklyEntries.length > 0
      ? weeklyEntries.reduce((sum, day) => sum + (Number(day.totalCalories) || 0), 0) /
        weeklyEntries.length
      : 0

  // Calculate monthly progress (days with logged food)
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthAgoDate = formatLocalDate(monthAgo)

  const monthlyDays = await db
    .select({
      date: foodEntries.date,
    })
    .from(foodEntries)
    .where(
      and(
        eq(foodEntries.userId, session.user.id),
        gte(foodEntries.date, monthAgoDate),
        lte(foodEntries.date, today),
      ),
    )
    .groupBy(foodEntries.date)

  // Calculate streak (consecutive days with logged food)
  const recentDays = await db
    .select({
      date: foodEntries.date,
    })
    .from(foodEntries)
    .where(eq(foodEntries.userId, session.user.id))
    .groupBy(foodEntries.date)
    .orderBy(desc(foodEntries.date))

  let streakDays = 0
  const todayTime = new Date(today).getTime()

  for (let i = 0; i < recentDays.length; i++) {
    const dayTime = new Date(recentDays[i].date).getTime()
    const expectedDayTime = todayTime - i * 24 * 60 * 60 * 1000

    if (Math.abs(dayTime - expectedDayTime) < 24 * 60 * 60 * 1000) {
      streakDays++
    } else {
      break
    }
  }

  return {
    todayCalories: todaySummary?.totalCalories || 0,
    todayGoal: goals.calorieGoal,
    weeklyAverage: Math.round(weeklyAverage),
    monthlyProgress: monthlyDays.length,
    streakDays,
  }
}

async function updateDailyNutritionSummary(userId: string, date: string): Promise<void> {
  // Calculate totals for the day
  const dayEntries = await db
    .select()
    .from(foodEntries)
    .where(and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)))

  const totals = dayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories * entry.quantity,
      protein: acc.protein + (entry.protein || 0) * entry.quantity,
      carbs: acc.carbs + (entry.carbs || 0) * entry.quantity,
      fat: acc.fat + (entry.fat || 0) * entry.quantity,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  )

  // Get existing summary or create default goals
  let [existingSummary] = await db
    .select()
    .from(dailyNutritionSummaries)
    .where(and(eq(dailyNutritionSummaries.userId, userId), eq(dailyNutritionSummaries.date, date)))

  if (existingSummary) {
    await db
      .update(dailyNutritionSummaries)
      .set({
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        updatedAt: new Date(),
      })
      .where(eq(dailyNutritionSummaries.id, existingSummary.id))
  } else {
    await db.insert(dailyNutritionSummaries).values({
      date,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      userId,
    })
  }
} 