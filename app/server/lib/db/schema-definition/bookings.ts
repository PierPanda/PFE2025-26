import { pgTable, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { learners } from "./learners";
import { availabilities } from "./availabilities";
import { courses } from "./courses";

export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id),
  availabilityId: text("availabilityId")
    .notNull()
    .references(() => availabilities.id),
  learnerId: text("learnerId")
    .notNull()
    .references(() => learners.id),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  priceAtBooking: numeric("priceAtBooking").notNull(),
  status: bookingStatus("status").notNull(),
  paymentIntentId: text("paymentIntentId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
