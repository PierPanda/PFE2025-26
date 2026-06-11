ALTER TABLE "ratings" DROP CONSTRAINT "ratings_teacherId_teachers_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "ratings_learnerId_teacherId_unique";
--> statement-breakpoint
DELETE FROM "ratings";
--> statement-breakpoint
ALTER TABLE "ratings" RENAME COLUMN "teacherId" TO "courseId";
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_learnerId_courseId_unique" ON "ratings" USING btree ("learnerId","courseId");
