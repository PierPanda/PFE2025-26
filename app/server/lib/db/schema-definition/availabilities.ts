import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { teachers } from './teachers';

export const availabilities = pgTable('availabilities', {
  id: text('id').primaryKey(),
  teacherId: text('teacherId')
    .notNull()
    .references(() => teachers.id),
  startTime: timestamp('startTime').notNull(),
  endTime: timestamp('endTime').notNull(),
  isException: boolean('isException').notNull().default(false),
  exceptionReason: text('exceptionReason'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
