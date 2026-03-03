import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { learners } from './learners';

export const ratings = pgTable('ratings', {
  id: text('id').primaryKey(),
  courseId: text('courseId')
    .notNull()
    .references(() => courses.id),
  learnerId: text('learnerId')
    .notNull()
    .references(() => learners.id),
  title: text('title').notNull(),
  description: text('description'),
  rate: numeric('rate').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
