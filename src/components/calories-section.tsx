'use client'

import { useOptimistic, useTransition, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  createFoodEntry,
  deleteFoodEntry,
  updateFoodEntry,
  updateNutritionGoals,
  getNutritionGoals,
} from '@/lib/actions/calories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import TextareaAutosize from 'react-textarea-autosize'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  ChartConfig,
  ChartContainer,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, Label as RechartsLabel, Tooltip } from 'recharts'
import {
  IconPlus,
  IconTrash,
  IconTarget,
  IconEggCrackedFilled,
  IconPointFilled,
  IconFlameFilled,
  IconBowlChopsticksFilled,
  IconCookieFilled,
  IconDropletFilled,
  IconSoupFilled,
  IconBowlFilled,
  IconEggFilled,
  IconBreadFilled,
} from '@tabler/icons-react'
import {
  FoodEntry,
  DailyNutritionSummary,
  NutritionGoals,
  CalorieTrackingStats,
  MealType,
  CreateFoodEntryData,
  UpdateFoodEntryData,
} from '@/types'
import { formatLocalDate, getCurrentISTDate } from '@/lib/utils'

type OptimisticAction =
  | { type: 'add'; entry: FoodEntry }
  | { type: 'update'; entry: FoodEntry }
  | { type: 'delete'; id: number }

function optimisticReducer(
  state: FoodEntry[],
  action: OptimisticAction,
): FoodEntry[] {
  switch (action.type) {
    case 'add':
      return [...state, action.entry]
    case 'update':
      return state.map((entry) =>
        entry.id === action.entry.id ? action.entry : entry,
      )
    case 'delete':
      return state.filter((entry) => entry.id !== action.id)
    default:
      return state
  }
}

type OptimisticGoalsPayload = {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

function optimisticGoalsReducer(
  state: NutritionGoals,
  newGoals: OptimisticGoalsPayload,
): NutritionGoals {
  return { ...state, ...newGoals };
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']

interface CaloriesSectionProps {
  foodEntries: FoodEntry[]
  dailySummary: DailyNutritionSummary | null
  nutritionGoals: NutritionGoals
  stats: CalorieTrackingStats
}

export function CaloriesSection({
  foodEntries,
  dailySummary,
  nutritionGoals,
  stats,
}: CaloriesSectionProps) {
  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    foodEntries,
    optimisticReducer,
  )
  const [, startEntryTransition] = useTransition()

  const [optimisticGoals, setOptimisticGoals] = useOptimistic(
    nutritionGoals,
    optimisticGoalsReducer,
  )
  const [isGoalsUpdating, startGoalsTransition] = useTransition()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [formData, setFormData] = useState<Partial<CreateFoodEntryData>>({})
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

  const [goalData, setGoalData] = useState({
    calorieGoal: optimisticGoals.calorieGoal,
    proteinGoal: optimisticGoals.proteinGoal,
    carbsGoal: optimisticGoals.carbsGoal,
    fatGoal: optimisticGoals.fatGoal,
  })

  const searchParams = useSearchParams()
  const selectedDate = searchParams.get('date') || formatLocalDate(getCurrentISTDate())

  const chartConfig = {
    energy: {
      label: 'Energy',
      color: 'oklch(0.6296 0.1726 25.41)',
    },
    protein: {
      label: 'Protein',
      color: 'oklch(0.6058 0.1674 252.7)',
    },
    carbs: {
      label: 'Carbs',
      color: 'oklch(0.7227 0.192 149.58)',
    },
    fat: {
      label: 'Fat',
      color: 'oklch(0.8145 0.1684 76.44)',
    },
    other: {
      label: 'Other',
      color: 'oklch(0.269 0 0)',
    },
  } satisfies ChartConfig

  // Create chart data for circular progress
  const chartData = useMemo(() => {
    const totalCalories = dailySummary?.totalCalories || 0
    const totalProtein = dailySummary?.totalProtein || 0
    const totalCarbs = dailySummary?.totalCarbs || 0
    const totalFat = dailySummary?.totalFat || 0

    const proteinCalories = totalProtein * 4
    const carbsCalories = totalCarbs * 4
    const fatCalories = totalFat * 9
    const totalMacroCalories = proteinCalories + carbsCalories + fatCalories
    const otherCalories = Math.max(
      0,
      totalCalories - totalMacroCalories,
    )
    const remaining = Math.max(0, optimisticGoals.calorieGoal - totalCalories)

    return {
      energy: {
        consumed: totalCalories,
        target: optimisticGoals.calorieGoal,
        remaining,
        percentage: Math.round((totalCalories / optimisticGoals.calorieGoal) * 100),
        breakdown: {
          protein: proteinCalories,
          carbs: carbsCalories,
          fat: fatCalories,
          other: otherCalories,
        },
      },
      macros: [
        {
          name: 'Protein',
          current: totalProtein,
          goal: optimisticGoals.proteinGoal,
          unit: 'g',
          percentage: Math.round((totalProtein / optimisticGoals.proteinGoal) * 100),
          color: chartConfig.protein.color,
        },
        {
          name: 'Carbs',
          current: totalCarbs,
          goal: optimisticGoals.carbsGoal,
          unit: 'g',
          percentage: Math.round((totalCarbs / optimisticGoals.carbsGoal) * 100),
          color: chartConfig.carbs.color,
        },
        {
          name: 'Fat',
          current: totalFat,
          goal: optimisticGoals.fatGoal,
          unit: 'g',
          percentage: Math.round((totalFat / optimisticGoals.fatGoal) * 100),
          color: chartConfig.fat.color,
        },
      ],
    }
  }, [dailySummary, optimisticGoals])

  const openCreateModal = (mealType: MealType = 'Other') => {
    setFormData({
      mealType,
      quantity: 1,
      unit: 'serving',
      date: selectedDate,
    })
    setEditingEntry(null)
    setIsEditMode(false)
    setIsCreateModalOpen(true)
  }

  const openEditModal = (entry: FoodEntry) => {
    setFormData({
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein || undefined,
      carbs: entry.carbs || undefined,
      fat: entry.fat || undefined,
      quantity: entry.quantity,
      unit: entry.unit,
      mealType: entry.mealType,
      notes: entry.notes || undefined,
    })
    setEditingEntry(entry)
    setIsEditMode(true)
    setIsCreateModalOpen(true)
  }

  const openGoalsModal = () => {
    setGoalData({
      calorieGoal: optimisticGoals.calorieGoal,
      proteinGoal: optimisticGoals.proteinGoal,
      carbsGoal: optimisticGoals.carbsGoal,
      fatGoal: optimisticGoals.fatGoal,
    })
    setIsGoalsModalOpen(true)
  }

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.calories) return

    const entryData: CreateFoodEntryData = {
      name: formData.name,
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      quantity: formData.quantity || 1,
      unit: formData.unit || 'serving',
      mealType: formData.mealType || 'Other',
      notes: formData.notes,
      date: selectedDate,
    }

    startEntryTransition(async () => {
      if (isEditMode && editingEntry) {
        const optimisticEntry: FoodEntry = {
          ...editingEntry,
          ...entryData,
          timestamp: editingEntry.timestamp,
          userId: editingEntry.userId,
        }
        addOptimisticEntry({ type: 'update', entry: optimisticEntry })
        
        try {
          await updateFoodEntry(editingEntry.id, entryData)
        } catch (error) {
          console.error('Error updating entry:', error)
        }
      } else {
        const optimisticEntry: FoodEntry = {
          id: Date.now(),
          name: entryData.name,
          calories: entryData.calories,
          protein: entryData.protein || null,
          carbs: entryData.carbs || null,
          fat: entryData.fat || null,
          quantity: entryData.quantity || 1,
          unit: entryData.unit || 'serving',
          mealType: entryData.mealType || 'Other',
          notes: entryData.notes || null,
          date: entryData.date || selectedDate,
          timestamp: new Date().toISOString(),
          userId: 'temp',
        }
        addOptimisticEntry({ type: 'add', entry: optimisticEntry })
        
        try {
          await createFoodEntry(entryData)
        } catch (error) {
          console.error('Error creating entry:', error)
        }
      }
    })

    closeModal()
  }

  const handleDeleteEntry = (id: number) => {
    startEntryTransition(async () => {
      addOptimisticEntry({ type: 'delete', id })
      try {
        await deleteFoodEntry(id)
      } catch (error) {
        console.error('Error deleting entry:', error)
      }
    })
  }

  const handleUpdateGoals = async () => {
    startGoalsTransition(async () => {
      setOptimisticGoals(goalData)
      try {
        await updateNutritionGoals(goalData)
        setIsGoalsModalOpen(false)
      } catch (error) {
        console.error('Error updating goals:', error)
      }
    })
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setIsGoalsModalOpen(false)
    setFormData({})
    setEditingEntry(null)
    setIsEditMode(false)
  }

  const getMealTypeColorClass = (mealType: MealType) => {
    switch (mealType) {
      case 'Breakfast':
        return 'text-[#ffb110]' // Orange/yellow for morning
      case 'Lunch':
        return 'text-[#22c55e]' // Green for midday
      case 'Dinner':
        return 'text-[#de5550]' // Red for evening
      case 'Snack':
        return 'text-[#2383e2]' // Blue for snacks
      case 'Other':
      default:
        return 'text-muted-foreground'
    }
  }

  // Organize entries by meal type
  const entriesByMeal = useMemo(() => {
    const organized: Record<MealType, FoodEntry[]> = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
      Other: [],
    }

    optimisticEntries.forEach((entry) => {
      organized[entry.mealType].push(entry)
    })

    return organized
  }, [optimisticEntries])

  const FoodEntryItem = ({ entry }: { entry: FoodEntry }) => (
    <div
      key={entry.id}
      className="group flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
      onClick={() => openEditModal(entry)}
    >
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground">{entry.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconFlameFilled className="h-3 w-3 text-orange-400" />
            <span>{entry.calories} kcal</span>
          </div>
          {/* <IconPointFilled className="h-2 w-2 text-muted-foreground/50" /> */}
          <div className="flex items-center gap-1">
            <span>{entry.quantity} {entry.unit}</span>
          </div>
          
          {entry.protein && (
            <>
              {/* <IconPointFilled className="h-2 w-2 text-muted-foreground/50" /> */}
              <div className="flex items-center gap-1">
                <IconEggFilled className="h-3 w-3 text-red-400" />
                <span>{entry.protein}g</span>
              </div>
            </>
          )}
          {entry.carbs && (
            <>
              {/* <IconPointFilled className="h-2 w-2 text-muted-foreground/50" /> */}
              <div className="flex items-center gap-1">
                <IconBreadFilled className="h-3 w-3 text-yellow-400" />
                <span>{entry.carbs}g</span>
              </div>
            </>
          )}
          {entry.fat && (
            <>
              {/* <IconPointFilled className="h-2 w-2 text-muted-foreground/50" /> */}
              <div className="flex items-center gap-1">
                <IconDropletFilled className="h-3 w-3 text-blue-400" />
                <span>{entry.fat}g</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground transition-opacity hover:text-destructive group-hover:opacity-100 md:opacity-0"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteEntry(entry.id)
          }}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <style>{`
        [data-slot="dialog-content"] *:focus,
        [data-slot="dialog-content"] *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          ring-width: 0 !important;
        }
      `}</style>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">
            Calorie Tracker
          </h1>
          <p className="text-muted-foreground text-lg select-none">
            Track your nutrition and achieve your health goals
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm m-2"
          variant="outline"
          onClick={() => openCreateModal()}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          New Food
        </Button>
      </div>

      {/* Energy Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Energy Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Energy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-full">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const itemValue = Number(payload[0].value) || 0;
                        const totalValue = chartData.energy.consumed;
                        const percentage = totalValue > 0 ? ((itemValue / totalValue) * 100).toFixed(0) : 0;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {data.name}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {itemValue} kcal
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Percent
                                </span>
                                <span className="font-bold text-foreground">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={Object.entries(chartData.energy.breakdown)
                      .filter(([, value]) => value > 0)
                      .map(([name, value]) => ({ name, value }))
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius="85%"
                    outerRadius="100%"
                    strokeWidth={1}
                    startAngle={90}
                    endAngle={450}
                    cornerRadius={5}
                    paddingAngle={2}
                  >
                    {Object.entries(chartData.energy.breakdown)
                      .filter(([, value]) => value > 0)
                      .map(([key]) => (
                        <Cell key={`cell-${key}`} fill={chartConfig[key as keyof typeof chartConfig].color} />
                    ))}
                    <RechartsLabel
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {chartData.energy.consumed.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Total kcal
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Targets Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Targets</CardTitle>
            <Button onClick={openGoalsModal} variant="outline" size="sm">
              <IconTarget className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Energy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Energy</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {chartData.energy.consumed} / {chartData.energy.target} kcal
                  </div>
                  <div className="text-sm text-muted-foreground">{chartData.energy.percentage}%</div>
                </div>
              </div>
              <Progress 
                value={chartData.energy.percentage} 
                className="h-2 [&>div]:bg-[var(--progress-color)]"
                style={{ '--progress-color': chartConfig.energy.color } as React.CSSProperties}
              />
            </div>

            {/* Macros */}
            {chartData.macros.map((macro) => (
              <div key={macro.name} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{macro.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {macro.current} / {macro.goal} {macro.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">{macro.percentage}%</div>
                  </div>
                </div>
                <Progress
                  value={macro.percentage}
                  className="h-2 [&>div]:bg-[var(--progress-color)]"
                  style={{ '--progress-color': macro.color } as React.CSSProperties}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {MEAL_TYPES.map((mealType) => (
          <Card key={mealType}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{mealType}</CardTitle>
              <Button onClick={() => openCreateModal(mealType)} size="sm" variant="outline">
                <IconPlus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {entriesByMeal[mealType].length === 0 ? (
                <div className="text-center text-muted-foreground">
                </div>
              ) : (
                <div className="space-y-1">
                  {entriesByMeal[mealType].map((entry) => (
                    <FoodEntryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Food Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
        <DialogContent 
          className="border-none sm:max-w-[500px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <div className="flex gap-3 items-center pr-8">
                <Input
                  placeholder={isEditMode ? 'Edit food name' : 'Food name'}
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-none !pl-0 !text-lg focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                  autoComplete="off"
                />
                <Select
                  value={formData.mealType || 'Other'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mealType: value as MealType }))}
                >
                  <SelectTrigger
                    size="sm"
                    className="border-text-muted-foreground text-muted-foreground rounded-sm px-2 py-0 text-xs focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  >
                    <SelectValue placeholder="Meal" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="Breakfast" className="text-xs">
                      <IconEggCrackedFilled className={`h-3 w-3 ${getMealTypeColorClass('Breakfast')}`} />
                      Breakfast
                    </SelectItem>
                    <SelectItem value="Lunch" className="text-xs">
                      <IconBowlChopsticksFilled className={`h-3 w-3 ${getMealTypeColorClass('Lunch')}`} />
                      Lunch
                    </SelectItem>
                    <SelectItem value="Dinner" className="text-xs">
                      <IconSoupFilled className={`h-3 w-3 ${getMealTypeColorClass('Dinner')}`} />
                      Dinner
                    </SelectItem>
                    <SelectItem value="Snack" className="text-xs">
                      <IconCookieFilled className={`h-3 w-3 ${getMealTypeColorClass('Snack')}`} />
                      Snack
                    </SelectItem>
                    <SelectItem value="Other" className="text-xs">
                      <IconBowlFilled className={`h-3 w-3 ${getMealTypeColorClass('Other')}`} />
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Calories and Quantity Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex h-9 w-full items-center rounded-md border px-3 text-sm">
                  <input
                    type="number"
                    placeholder="Calories (kcal)"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <div className="flex h-9 w-full items-center rounded-md border px-3 text-sm">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none w-12"
                  />
                  <input
                    placeholder="unit"
                    value={formData.unit || 'serving'}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="placeholder:text-muted-foreground bg-transparent outline-none text-xs flex-1 ml-2"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Macronutrients</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={formData.protein || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, protein: parseInt(e.target.value) || undefined }))}
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={formData.carbs || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseInt(e.target.value) || undefined }))}
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={formData.fat || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fat: parseInt(e.target.value) || undefined }))}
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <TextareaAutosize
              placeholder="Add any notes..."
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="placeholder:text-muted-foreground flex w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              minRows={2}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              {isEditMode && editingEntry && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteEntry(editingEntry.id)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleFormSubmit} 
                disabled={!formData.name || !formData.calories}
                variant="outline"
              >
                {isEditMode ? 'Save' : 'Add food'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals Modal */}
      <Dialog open={isGoalsModalOpen} onOpenChange={closeModal}>
        <DialogContent 
          className="border-none sm:max-w-[500px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder="Set your daily nutrition goals"
                value="Daily Nutrition Goals"
                readOnly
                className="border-none !pl-0 !text-lg focus-visible:ring-0 focus-visible:ring-offset-0 font-semibold"
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Daily Calories */}
            <div>
              <div className="flex h-9 w-full items-center rounded-md border px-3 text-sm">
                <input
                  type="number"
                  placeholder="Daily calories (kcal)"
                  value={goalData.calorieGoal}
                  onChange={(e) =>
                    setGoalData(prev => ({
                      ...prev,
                      calorieGoal: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Daily Macronutrient Goals</span>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={goalData.proteinGoal}
                    onChange={(e) =>
                      setGoalData(prev => ({
                        ...prev,
                        proteinGoal: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={goalData.carbsGoal}
                    onChange={(e) =>
                      setGoalData(prev => ({
                        ...prev,
                        carbsGoal: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
                <div className="flex h-9 w-full items-center rounded-md border px-2 text-sm">
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={goalData.fatGoal}
                    onChange={(e) =>
                      setGoalData(prev => ({
                        ...prev,
                        fatGoal: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGoals} variant="outline" disabled={isGoalsUpdating}>
                {isGoalsUpdating ? 'Saving...' : 'Save Goals'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 