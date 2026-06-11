ALTER TABLE "ratings" RENAME COLUMN "courseId" TO "teacherId";--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_courseId_courses_id_fk";
--> statement-breakpoint
UPDATE "ratings" SET "teacherId" = (SELECT "teacherId" FROM "courses" WHERE "courses"."id" = "ratings"."teacherId");
--> statement-breakpoint
DELETE FROM "ratings" WHERE "teacherId" NOT IN (SELECT "id" FROM "teachers");
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_teacherId_teachers_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP INDEX IF EXISTS "ratings_learnerId_courseId_unique";--> statement-breakpoint
DELETE FROM "ratings" WHERE "id" NOT IN (
  SELECT DISTINCT ON ("learnerId", "teacherId") "id"
  FROM "ratings"
  ORDER BY "learnerId", "teacherId", "createdAt" DESC
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_learnerId_teacherId_unique" ON "ratings" USING btree ("learnerId","teacherId");