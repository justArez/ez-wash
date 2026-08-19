CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."claimed_promo_status" AS ENUM('ACTIVE', 'USED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."priority_status" AS ENUM('normal', 'LOW_PRIORITIED');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('earn', 'spend', 'expire');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('car', 'motorcycle', 'suv', 'van');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"vehicle_plate" text NOT NULL,
	"service_id" text,
	"date" timestamp with time zone NOT NULL,
	"time_slot" text,
	"duration_minutes" integer,
	"bay_id" text,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"points_spent" integer DEFAULT 0 NOT NULL,
	"applied_perks" text[] NOT NULL,
	"applied_promo_id" text,
	"is_late_cancellation" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claimed_promos" (
	"id" text PRIMARY KEY NOT NULL,
	"promo_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"perk_identifier" text NOT NULL,
	"status" "claimed_promo_status" DEFAULT 'ACTIVE' NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"full_name" text,
	"username" text,
	"email" text,
	"tier_id" text DEFAULT 'member' NOT NULL,
	"points_balance" integer DEFAULT 0 NOT NULL,
	"late_cancellation_warnings" integer DEFAULT 0 NOT NULL,
	"priority_status" "priority_status" DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "loyalty_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text,
	"point_threshold" integer DEFAULT 0 NOT NULL,
	"booking_window_days" integer DEFAULT 7 NOT NULL,
	"point_rate" double precision DEFAULT 1 NOT NULL,
	"multiplier" text,
	"discount" text,
	"perks" text[] NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"tier_set_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"description" text NOT NULL,
	"category" text,
	"discount_percentage" double precision,
	"point_price" integer,
	"applicable_tiers" text[] NOT NULL,
	"applicable_vehicle_models" text[] NOT NULL,
	"badge_label" text,
	"banner_image" text,
	"terms" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "promotion_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"points_required" integer NOT NULL,
	"eligible_tiers" text[] NOT NULL,
	"vehicle_types" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price" double precision NOT NULL,
	"popularity_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"features" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"plate" text NOT NULL,
	"model" text NOT NULL,
	"type" "vehicle_type" DEFAULT 'car' NOT NULL,
	"last_wash_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_loyalty_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."loyalty_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_service_items_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claimed_promos" ADD CONSTRAINT "claimed_promos_promo_id_promotions_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claimed_promos" ADD CONSTRAINT "claimed_promos_customer_id_loyalty_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."loyalty_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_customers" ADD CONSTRAINT "loyalty_customers_tier_id_loyalty_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_tiers" ADD CONSTRAINT "loyalty_tiers_tier_set_id_tier_sets_id_fk" FOREIGN KEY ("tier_set_id") REFERENCES "public"."tier_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_customer_id_loyalty_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."loyalty_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_loyalty_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."loyalty_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "bookings_customer_id_idx" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookings_service_id_idx" ON "bookings" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "claimed_promos_customer_id_idx" ON "claimed_promos" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "claimed_promos_promo_id_idx" ON "claimed_promos" USING btree ("promo_id");--> statement-breakpoint
CREATE INDEX "loyalty_customers_tier_id_idx" ON "loyalty_customers" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "loyalty_customers_phone_idx" ON "loyalty_customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "loyalty_tiers_tier_set_id_idx" ON "loyalty_tiers" USING btree ("tier_set_id");--> statement-breakpoint
CREATE INDEX "point_transactions_customer_id_idx" ON "point_transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "point_transactions_date_idx" ON "point_transactions" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_customer_plate_idx" ON "vehicles" USING btree ("customer_id","plate");--> statement-breakpoint
CREATE INDEX "vehicles_customer_id_idx" ON "vehicles" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "vehicles_plate_idx" ON "vehicles" USING btree ("plate");