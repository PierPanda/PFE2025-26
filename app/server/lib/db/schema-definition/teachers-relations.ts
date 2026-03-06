import { relations } from 'drizzle-orm';
import { teachers } from './teachers';
import { user } from './auth-schema';
import { courses } from './courses';
import { availabilities } from './availabilities';

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(user, {
    fields: [teachers.userId],
    references: [user.id],
  }),
  courses: many(courses),
  availabilities: many(availabilities),
}));
