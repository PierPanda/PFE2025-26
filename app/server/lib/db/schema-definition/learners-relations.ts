import { relations } from 'drizzle-orm';
import { learners } from './learners';
import { user } from './auth-schema';
import { bookings } from './bookings';
import { ratings } from './ratings';

export const learnersRelations = relations(learners, ({ one, many }) => ({
  user: one(user, {
    fields: [learners.userId],
    references: [user.id],
  }),
  bookings: many(bookings),
  ratings: many(ratings),
}));
