CREATE TABLE IF NOT EXISTS "schedule_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"reason" text,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"start_time" text,
	"end_time" text,
	"bay_id" text DEFAULT 'all' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_blocks_start_date_idx" ON "schedule_blocks" USING btree ("start_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_blocks_end_date_idx" ON "schedule_blocks" USING btree ("end_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_blocks_is_active_idx" ON "schedule_blocks" USING btree ("is_active");
