CREATE TABLE IF NOT EXISTS "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'EUR',
	"billing_type" text,
	"billing_period" text,
	"status" text,
	"tax_mode" text,
	"tax_category" text,
	"product_url" text,
	"default_success_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"features" jsonb,
	"mode" text,
	"object" text
);
--> statement-breakpoint
DROP TABLE "subscription" CASCADE;