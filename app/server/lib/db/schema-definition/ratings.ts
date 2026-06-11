import { pgTable, text, numeric, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { teachers } from './teachers';
import { learners } from './learners';

export const ratings = pgTable(
  'ratings',
  {
    id: text('id').primaryKey(),
    teacherId: text('teacherId')
      .notNull()
      .references(() => teachers.id),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id),
    title: text('title').notNull(),
    description: text('description'),
    rate: numeric('rate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('ratings_learnerId_teacherId_unique').on(t.learnerId, t.teacherId)],
);
