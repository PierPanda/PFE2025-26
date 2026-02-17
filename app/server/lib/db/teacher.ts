import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const teacher = pgTable('teacher', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  description: text('description'),
  graduation: jsonb('graduation').default({}),
  skill: text('skill'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
