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

export const categoryValues = [
  "piano",
  "guitar",
  "violin",
  "drums",
  "bass",
  "saxophone",
  "flute",
  "trumpet",
  "cello",
  "ukulele",
  "vocals",
  "choir",
  "songwriting",
  "music-theory",
  "ear-training",
  "clarinet",
  "trombone",
  "oboe",
  "harp",
  "accordion",
  "banjo",
  "mandolin",
  "percussion",
  "dj",
  "music-production",
  "composition",
  "sight-singing",
] as const;

export type CourseCategory = (typeof categoryValues)[number];

export const category = pgEnum("category", categoryValues);

export const levelValues = ["beginner", "intermediate", "advanced"] as const;

export type CourseLevel = (typeof levelValues)[number];

export const courseLevel = pgEnum("courseLevel", levelValues);

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacherId")
    .notNull()
    .references(() => teachers.id),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  level: courseLevel("level").notNull(),
  price: numeric("price").notNull(),
  isPublished: boolean("isPublished").notNull(),
  category: category("category").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
