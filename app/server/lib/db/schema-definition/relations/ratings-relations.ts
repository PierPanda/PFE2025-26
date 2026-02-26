import { relations } from "drizzle-orm";
import { ratings } from "../ratings";
import { courses } from "../courses";
import { learners } from "../learners";

export const ratingsRelations = relations(ratings, ({ one }) => ({
  course: one(courses, {
    fields: [ratings.courseId],
    references: [courses.id],
  }),
  learner: one(learners, {
    fields: [ratings.learnerId],
    references: [learners.id],
  }),
}));
