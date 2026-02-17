CREATE TABLE "teacher" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"description" text,
	"graduation" jsonb DEFAULT '{}'::jsonb,
	"skill" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;