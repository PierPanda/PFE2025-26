import {
  pgTable,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { teachers } from "./teachers";

export const category = pgEnum("category", [""]);

export const courses = pgTable("course", {
  id: text("id").primaryKey(),
  teacherId: text("teacherId")
    .notNull()
    .references(() => teachers.id),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  level: text("level").notNull(),
  price: numeric("price").notNull(),
  isPublished: boolean("isPublished").notNull(),
  category: category("category").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
