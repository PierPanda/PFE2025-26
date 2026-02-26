import { relations } from "drizzle-orm";
import { bookings } from "../bookings";
import { courses } from "../courses";
import { availabilities } from "../availabilities";
import { learners } from "../learners";

export const bookingsRelations = relations(bookings, ({ one }) => ({
  course: one(courses, {
    fields: [bookings.courseId],
    references: [courses.id],
  }),
  availability: one(availabilities, {
    fields: [bookings.availabilityId],
    references: [availabilities.id],
  }),
  learner: one(learners, {
    fields: [bookings.learnerId],
    references: [learners.id],
  }),
}));
