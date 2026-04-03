ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('piano', 'guitare', 'violon', 'batterie', 'basse', 'saxophone', 'flute', 'trompette', 'violoncelle', 'ukulele', 'chant', 'chorale', 'solfege', 'clarinette', 'trombone', 'hautbois', 'harpe', 'accordeon', 'banjo', 'mandoline', 'percussions', 'dj', 'production-musicale', 'autre');--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "availabilities" ADD COLUMN "isException" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "availabilities" ADD COLUMN "exceptionReason" text;