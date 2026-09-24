ALTER TABLE "organizations" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
UPDATE "organizations" SET "timezone" = "appointments_availability"."timezone" FROM "appointments_availability" WHERE "appointments_availability"."organization" = "organizations"."id";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "timezone" text;--> statement-breakpoint
UPDATE "appointments" SET "timezone" = "organizations"."timezone" FROM "organizations" WHERE "organizations"."id" = "appointments"."organization";--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "timezone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "starts_at" SET DATA TYPE timestamp USING "starts_at" AT TIME ZONE "timezone";--> statement-breakpoint
ALTER TABLE "appointments_availability" DROP COLUMN "timezone";
