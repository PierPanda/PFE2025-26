import { teachers } from '~/server/lib/db/schema-definition/teachers';

export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
