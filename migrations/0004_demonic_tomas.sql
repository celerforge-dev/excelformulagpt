CREATE TABLE IF NOT EXISTS "plan" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"productName" text,
	"variantId" integer NOT NULL,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"isUsageBased" boolean DEFAULT false,
	"interval" text,
	"intervalCount" integer,
	"trialInterval" text,
	"trialIntervalCount" integer,
	"sort" integer,
	CONSTRAINT "plan_variantId_unique" UNIQUE("variantId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhookEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"eventName" text NOT NULL,
	"processed" boolean DEFAULT false,
	"body" jsonb NOT NULL,
	"processingError" text
);
--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "lemonSqueezyId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "orderId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "statusFormatted" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "renewsAt" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "endsAt" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "trialEndsAt" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "price" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "isUsageBased" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "isPaused" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "subscriptionItemId" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "planId" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_plan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "plan_type";--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "start_at";--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "expire_at";--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_lemonSqueezyId_unique" UNIQUE("lemonSqueezyId");