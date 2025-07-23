'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IconPlus,
  IconTrash,
  IconCalendar,
  IconCircleCheck,
  IconGripVertical,
} from '@tabler/icons-react'
import {
  createDailyLog,
  updateDailyLog,
  deleteDailyLog,
} from '@/lib/actions/daily-logs'
import { toast } from 'sonner'
import type { DailyLog } from '@/types'
import { DatePicker } from './ui/date-picker'
import TextareaAutosize from 'react-textarea-autosize'
import { isToday, isYesterday, isThisWeek, parseISO } from 'date-fns'
import { formatLocalDate } from '@/lib/utils'

interface DailyLogsSectionProps {
  dailyLogs: DailyLog[]
}

type Action =
  | { type: 'add'; log: DailyLog }
  | { type: 'update'; log: DailyLog }
  | { type: 'delete'; id: number }

function optimisticReducer(
  state: DailyLog[],
  { type, log, id }: { type: Action['type']; log?: DailyLog; id?: number },
) {
  switch (type) {
    case 'add':
      return [log as DailyLog, ...state]
    case 'update':
      return state.map((l) => (l.id === (log as DailyLog).id ? { ...l, ...log } : l))
    case 'delete':
      return state.filter((l) => l.id !== id)
    default:
      return state
  }
}

export function DailyLogsSection({ dailyLogs }: DailyLogsSectionProps) {
  const [optimisticDailyLogs, addOptimisticLog] = useOptimistic(
    dailyLogs,
    optimisticReducer,
  )
  const [, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)
  const [editForm, setEditForm] = useState({
    date: new Date(),
    description: '',
  })

  const handleOpenDialog = (log: DailyLog | null) => {
    setEditingLog(log)
    if (log) {
      setEditForm({
        date: new Date(log.date),
        description: log.description || '',
      })
    } else {
      setEditForm({ date: new Date(), description: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsDialogOpen(false)

    const data = {
      date: formatLocalDate(editForm.date),
      description: editForm.description || null,
    }

    if (editingLog) {
      const updatedLog = { ...editingLog, ...data }
      startTransition(async () => {
        addOptimisticLog({ type: 'update', log: updatedLog })
        await updateDailyLog(editingLog.id, data)
        toast.success('Daily log updated successfully')
      })
    } else {
      const newLog = {
        id: Date.now(),
        ...data,
        userId: '',
        createdAt: new Date(),
      }
      startTransition(async () => {
        addOptimisticLog({ type: 'add', log: newLog as unknown as DailyLog })
        await createDailyLog(data)
        toast.success('Daily log created successfully')
      })
    }
  }

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      addOptimisticLog({ type: 'delete', id })
      await deleteDailyLog(id)
      toast.success('Daily log deleted successfully')
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
  }

  const todayLogs = optimisticDailyLogs.filter((log) =>
    isToday(parseISO(log.date)),
  )
  const yesterdayLogs = optimisticDailyLogs.filter((log) =>
    isYesterday(parseISO(log.date)),
  )
  const thisWeekLogs = optimisticDailyLogs.filter((log) => {
    const date = parseISO(log.date)
    return !isToday(date) && !isYesterday(date) && isThisWeek(date)
  })
  const olderLogs = optimisticDailyLogs.filter((log) => {
    const date = parseISO(log.date)
    return !isToday(date) && !isYesterday(date) && !isThisWeek(date)
  })

  const LogItem = ({ log }: { log: DailyLog }) => (
    <Card
      className="group cursor-pointer border-none !py-3 transition-colors hover:bg-card/80"
      onClick={() => handleOpenDialog(log)}
    >
      <CardContent className="py-0">
        <div className="flex items-start gap-3">
          <IconGripVertical className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0 cursor-grab" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{log.description}</p>
            <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
              <IconCalendar className="h-3 w-3" />
              <span>{formatDate(log.date)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive transition-opacity md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(log.id)
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
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">
            Daily Logs
          </h1>
          <p className="text-muted-foreground text-lg select-none">
            Track your daily reflections and progress
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm m-2"
          variant="outline"
          onClick={() => handleOpenDialog(null)}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          New Log
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="border-none sm:max-w-[500px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <TextareaAutosize
                id="description"
                name="description"
                placeholder="What happened today?"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full resize-none border-none bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                minRows={1}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="w-fit">
              <DatePicker
                selectedDate={editForm.date}
                onDateChange={(date) =>
                  date && setEditForm((prev) => ({ ...prev, date }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="outline">
              {editingLog ? 'Update' : 'Create Log'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {optimisticDailyLogs.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
          <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold tracking-tight">
            No daily logs yet
          </h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            You haven't created any daily logs yet.
          </p>
          <Button variant="outline" onClick={() => handleOpenDialog(null)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Log
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {todayLogs.length > 0 && (
            <div>
              <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
                Today
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconCircleCheck className="h-3 w-3" />
                  {todayLogs.length} logs
                </div>
              </h2>
              <div className="space-y-4">
                {todayLogs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}
          {yesterdayLogs.length > 0 && (
            <div>
              <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
                Yesterday
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconCircleCheck className="h-3 w-3" />
                  {yesterdayLogs.length} logs
                </div>
              </h2>
              <div className="space-y-4">
                {yesterdayLogs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}
          {thisWeekLogs.length > 0 && (
            <div>
              <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
                This Week
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconCircleCheck className="h-3 w-3" />
                  {thisWeekLogs.length} logs
                </div>
              </h2>
              <div className="space-y-4">
                {thisWeekLogs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}
          {olderLogs.length > 0 && (
            <div>
              <h2 className="text-foreground mb-4 flex flex-col gap-2 font-medium text-lg select-none">
                Older Logs
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconCircleCheck className="h-3 w-3" />
                  {olderLogs.length} logs
                </div>
              </h2>
              <div className="space-y-4">
                {olderLogs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 