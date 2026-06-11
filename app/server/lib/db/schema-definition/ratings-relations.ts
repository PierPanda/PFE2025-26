import { relations } from 'drizzle-orm';
import { ratings } from './ratings';
import { teachers } from './teachers';
import { learners } from './learners';

export const ratingsRelations = relations(ratings, ({ one }) => ({
  teacher: one(teachers, {
    fields: [ratings.teacherId],
    references: [teachers.id],
  }),
  learner: one(learners, {
    fields: [ratings.learnerId],
    references: [learners.id],
  }),
}));
