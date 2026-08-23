ALTER TABLE "loyalty_customers" DROP CONSTRAINT IF EXISTS "loyalty_customers_phone_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "vehicles_customer_plate_idx";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "loyalty_customers" ALTER COLUMN "phone" DROP NOT NULL;