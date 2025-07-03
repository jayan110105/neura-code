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
  priority: priorityEnum('priority'),
  dueDate: timestamp('due_date'),
  category: text('category'),
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
