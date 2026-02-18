import { pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const learner = pgTable('learner', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});
