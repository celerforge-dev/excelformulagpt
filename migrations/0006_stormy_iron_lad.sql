CREATE TABLE IF NOT EXISTS "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"customer_id" text,
	"status" text NOT NULL,
	"collection_method" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"canceled_at" timestamp,
	"last_transaction_id" text,
	"last_transaction_date" timestamp,
	"next_transaction_date" timestamp,
	"metadata" jsonb,
	"mode" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "image_url";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "currency";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "billing_type";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "billing_period";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "tax_mode";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "tax_category";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "product_url";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "default_success_url";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "features";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "mode";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "object";