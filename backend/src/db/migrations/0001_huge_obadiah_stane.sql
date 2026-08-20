ALTER TABLE "loyalty_customers" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "loyalty_customers" ADD COLUMN "collected_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "promo_type" text DEFAULT 'booking_discount';--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "bonus_points" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "discount_amount" double precision;--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "applicable_service_ids" text[];--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "applicable_days_of_week" integer[];--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "dedicated_date" text;