import { pgTable, text, boolean, numeric } from 'drizzle-orm/pg-core';
import { teacher } from './teacher';

export const course = pgTable('course', {
  id: text('id').primaryKey(),
  teacherId: text('teacherId')
    .notNull()
    .references(() => teacher.id),
  title: text('title').notNull(),
  description: text('description'),
  duration: numeric('duration').notNull(),
  level: text('level').notNull(),
  price: numeric('price').notNull(),
  isPublished: boolean('isPublished').notNull(),
  category: text('category').notNull(),
});
