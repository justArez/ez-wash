ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "service_ids" text[];--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "service_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booking_price" double precision;
