"use client"

import { Card, CardContent } from "@/components/ui/card"
import { NotesGrid } from "@/components/today/notes-grid"
import { BookmarksGrid } from "@/components/today/bookmarks-grid"
import { TodosList } from "@/components/today/todos-list"
import { RemindersList } from "@/components/today/reminders-list"

const mockTodayLogs = [
  {
    id: 1,
    type: "note" as const,
    title: "Project Ideas for Q1",
    preview: "Brainstorming session notes: 1. AI-powered task manager, 2. Smart calendar integration, 3. Voice-to-text note taking app...",
    timestamp: "14:30",
    source: "text",
  },
  {
    id: 2,
    type: "bookmark" as const,
    title: "The Future of AI in Product Design",
    preview: "Exploring how artificial intelligence is reshaping the design process and creating more intuitive user experiences...",
    timestamp: "16:20",
    source: "link",
    url: "https://designbetter.co/ai-design"
  },
  {
    id: 3,
    type: "todo" as const,
    title: "Review design mockups for mobile app",
    preview: "High priority task added to today's list",
    completed: false,
    priority: "High" as const,
    category: "Work",
    dueDate: "2024-01-15"
  },
  {
    id: 4,
    type: "reminder" as const,
    title: "Team standup meeting",
    time: "09:00",
    repeat: "Daily" as const,
    category: "Work" as const,
  },
  {
    id: 5,
    type: "note" as const,
    title: "Meeting with Sarah - Product Roadmap",
    preview: "Voice note from WhatsApp about product roadmap discussion. Key points: Q1 priorities, user feedback integration, new feature proposals...",
    timestamp: "10:15",
    source: "voice",
  },
  {
    id: 6,
    type: "bookmark" as const,
    title: "React Performance Best Practices",
    preview: "Comprehensive guide on optimizing React applications for better performance and user experience...",
    timestamp: "09:30",
    source: "link",
    url: "https://react.dev/learn/render-and-commit"
  },
  {
    id: 7,
    type: "todo" as const,
    title: "Update documentation for API endpoints",
    preview: "Medium priority task for development team",
    completed: true,
    priority: "Medium" as const,
    category: "Work",
    dueDate: "2024-01-14"
  },
  {
    id: 8,
    type: "reminder" as const,
    title: "Call dentist for appointment",
    time: "15:00",
    repeat: "Once" as const,
    category: "Personal" as const,
  }
]

const aiSummary =
  "Today you captured 8 items across different categories. Your main focus was on project planning and design work. You added 3 new notes, 2 bookmarks about design and development, 2 tasks, and set up 2 reminders. Most productive time was between 10-16:30."

export function TodaySection() {
  // Filter content by type
  const notes = mockTodayLogs.filter(log => log.type === "note")
  const bookmarks = mockTodayLogs.filter(log => log.type === "bookmark")
  const todos = mockTodayLogs.filter(log => log.type === "todo")
  const reminders = mockTodayLogs.filter(log => log.type === "reminder")

  // Event handlers
  const handleNoteClick = (noteId: number) => {
    console.log("Navigate to notes tab with note:", noteId)
    // TODO: Implement navigation to notes tab
  }

  const handleBookmarkClick = (bookmark: any) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank')
    }
  }

  const handleTodoClick = (todo: any) => {
    console.log("Todo clicked:", todo.id)
    // TODO: Implement todo interaction
  }

  const handleTodoToggle = (todoId: number) => {
    console.log("Todo toggled:", todoId)
    // TODO: Implement todo toggle functionality
  }

  const handleReminderClick = (reminder: any) => {
    console.log("Reminder clicked:", reminder.id)
    // TODO: Implement reminder interaction
  }

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-foreground mb-1">Today</h1>
        <p className="text-muted-foreground text-lg mb-6">Your captured content organized by type</p>

        <Card className="bg-card border-none">
          <CardContent className="px-6">
            <h3 className="font-medium text-foreground mb-2">Daily Log</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{aiSummary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Use separate components */}
      <NotesGrid notes={notes} onNoteClick={handleNoteClick} />
      <BookmarksGrid bookmarks={bookmarks} onBookmarkClick={handleBookmarkClick} />
      <TodosList todos={todos} onTodoClick={handleTodoClick} onTodoToggle={handleTodoToggle} />
      <RemindersList reminders={reminders} onReminderClick={handleReminderClick} />
    </div>
  )
} 