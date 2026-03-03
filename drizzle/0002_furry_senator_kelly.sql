ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('piano', 'guitare', 'violon', 'batterie', 'basse', 'saxophone', 'flute', 'trompette', 'violoncelle', 'ukulele', 'chant', 'chorale', 'solfege', 'clarinette', 'trombone', 'hautbois', 'harpe', 'accordeon', 'banjo', 'mandoline', 'percussions', 'dj', 'production-musicale', 'autre');--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "level" SET DATA TYPE "public"."courseLevel";