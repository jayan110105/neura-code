import { relations } from 'drizzle-orm'
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  date,
  time,
  pgEnum,
  integer,
  vector,
  index,
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export const priorityEnum = pgEnum('priority', ['High', 'Medium', 'Low'])
export const repeatEnum = pgEnum('repeat', [
  'Daily',
  'Weekly',
  'Monthly',
  'None',
])
export const categoryEnum = pgEnum('category', [
  'Work',
  'Health',
  'Personal',
  'Finance',
])

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedDate: timestamp('completed_date'),
  priority: priorityEnum('priority'),
  dueDate: timestamp('due_date'),
  reminderTime: time('reminder_time'),
  category: categoryEnum('category'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(user, {
    fields: [todos.userId],
    references: [user.id],
  }),
}))

export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  time: time('time'),
  date: date('date'),
  repeat: repeatEnum('repeat'),
  enabled: boolean('enabled').default(true).notNull(),
  lastSent: timestamp('last_sent'),
  category: categoryEnum('category'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(user, {
    fields: [reminders.userId],
    references: [user.id],
  }),
}))

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(user, {
    fields: [notes.userId],
    references: [user.id],
  }),
}))

export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  tags: text('tags').array(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
}))

export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(user, {
    fields: [dailyLogs.userId],
    references: [user.id],
  }),
}))

export const dailySummaries = pgTable('daily_summaries', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  summary: text('summary').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(), // 'user' or 'assistant'
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  user: one(user, {
    fields: [dailySummaries.userId],
    references: [user.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(user, {
    fields: [messages.userId],
    references: [user.id],
  }),
}))

export const embeddings = pgTable('embeddings', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 512 }),
  contentType: text('content_type').notNull(),
  contentId: integer('content_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
])

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  user: one(user, {
    fields: [embeddings.userId],
    references: [user.id],
  }),
}))
