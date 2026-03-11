ALTER TABLE "user" ADD COLUMN "role" text NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banReason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banExpires" timestamp;
