import { relations } from 'drizzle-orm';
import { availabilities } from './availabilities';
import { teachers } from './teachers';
import { bookings } from './bookings';

export const availabilitiesRelations = relations(availabilities, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [availabilities.teacherId],
    references: [teachers.id],
  }),
  bookings: many(bookings),
}));
