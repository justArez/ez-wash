ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deposit_image_url" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deposit_submitted_at" timestamp with time zone;