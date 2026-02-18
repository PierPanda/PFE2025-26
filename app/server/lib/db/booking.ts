import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { learner } from './learner';
import { availability } from './availability';

export const booking = pgTable('booking', {
  id: text('id').primaryKey(),
  courseId: text('courseId')
    .notNull()
    .references(() => learner.id),
  availabilityId: text('availabilityId')
    .notNull()
    .references(() => availability.id),
  learnerId: text('learnerId')
    .notNull()
    .references(() => learner.id),
  startTime: timestamp('startTime').notNull().defaultNow(),
  endTime: timestamp('endTime').notNull().defaultNow(),
  priceAtBooking: numeric('priceAtBooking').notNull(),
  status: text('status'),
  paymentIntentId: text('paymentIntentId'),
});
