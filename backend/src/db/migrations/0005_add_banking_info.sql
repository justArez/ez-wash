CREATE TABLE IF NOT EXISTS "banking_info" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_code" text NOT NULL,
	"bank_name" text NOT NULL,
	"bank_branch" text,
	"account_number" text NOT NULL,
	"account_holder" text NOT NULL,
	"qr_template" text DEFAULT 'compact2' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "banking_info_is_default_idx" ON "banking_info" USING btree ("is_default");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "banking_info_is_active_idx" ON "banking_info" USING btree ("is_active");
