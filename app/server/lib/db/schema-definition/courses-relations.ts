import { relations } from 'drizzle-orm';
import { courses } from './courses';
import { teachers } from './teachers';
import { bookings } from './bookings';

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [courses.teacherId],
    references: [teachers.id],
  }),
  bookings: many(bookings),
}));
