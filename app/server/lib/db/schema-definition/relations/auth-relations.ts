import { relations } from "drizzle-orm";
import { user, session, account } from "../auth-schema";
import { teachers } from "../teachers";
import { learners } from "../learners";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  teacher: one(teachers, {
    fields: [user.id],
    references: [teachers.userId],
  }),
  learner: one(learners, {
    fields: [user.id],
    references: [learners.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
