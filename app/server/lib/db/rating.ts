import { pgTable, text, numeric } from 'drizzle-orm/pg-core';
import { course } from './course';
import { learner } from './learner';

export const rating = pgTable('rating', {
  id: text('id').primaryKey(),
  courseId: text('courseId')
    .notNull()
    .references(() => course.id),
  learnerId: text('learnerId')
    .notNull()
    .references(() => learner.id),
  title: text('title').notNull(),
  description: text('description'),
  rate: numeric('rate').notNull(),
});
