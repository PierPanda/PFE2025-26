import { pgTable, text, timestamp, boolean, jsonb, numeric } from 'drizzle-orm/pg-core';
import { user, session, account, verification } from './auth-schema';
import { teacher } from './teacher';
import { desc } from 'drizzle-orm';

export const learner = pgTable('learner', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});

export const availabilities = pgTable('availabilities', {
  id: text('id').primaryKey(),
  teacherId: text('teacherId')
    .notNull()
    .references(() => teacher.id),
  startTime: timestamp('startTime').notNull().defaultNow(),
  endTime: timestamp('endTime').notNull().defaultNow(),
});

export const booking = pgTable('booking', {
  id: text('id').primaryKey(),
  courseId: text('courseId')
    .notNull()
    .references(() => learner.id),
  availabilitiesId: text('availabilitiesId')
    .notNull()
    .references(() => availabilities.id),
  learnerId: text('learnerId')
    .notNull()
    .references(() => learner.id),
  startTime: timestamp('startTime').notNull().defaultNow(),
  endTime: timestamp('endTime').notNull().defaultNow(),
  priceAtBooking: numeric('priceAtBooking').notNull().default(0),
  status: text('status'),
  paymentIntentId: text('paymentIntentId'),
});

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

export const rating = pgTable('rating', {
  id: text('id').primaryKey(),
  courseId: text('courseId')
    .notNull()
    .references(() => course.id),
  learnerId: text('learnerId')
    .notNull()
    .references(() => learner.id),
  title: text('title').notNull(),
  description: text('description'),
  rate: numeric('rate').notNull(),
});
