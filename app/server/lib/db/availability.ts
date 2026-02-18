import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { teacher } from './teacher';

export const availability = pgTable('availability', {
  id: text('id').primaryKey(),
  teacherId: text('teacherId')
    .notNull()
    .references(() => teacher.id),
  startTime: timestamp('startTime').notNull(),
  endTime: timestamp('endTime').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
