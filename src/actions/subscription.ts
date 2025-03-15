"use server";

import { db } from "@/db/config";
import { PLAN_TIERS, PlanTier, products, subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

interface UserPlan {
  tier: PlanTier;
  expireAt: Date | null;
  status: string;
  productId: string | null;
}

/**
 * Get user's current active subscription
 */
export async function getUserPlan(): Promise<UserPlan> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      tier: PLAN_TIERS.FREE,
      expireAt: null,
      status: "active",
      productId: null,
    };
  }

  // Find active subscription for the user
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.user_id, session.user.id),
      eq(subscriptions.status, "active"),
    ),
  });

  if (!subscription) {
    // Check for trialing subscription as well
    const trialSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.user_id, session.user.id),
        eq(subscriptions.status, "trialing"),
      ),
    });

    if (trialSubscription) {
      // Get the product to determine tier
      const product = await db.query.products.findFirst({
        where: eq(products.id, trialSubscription.product_id),
      });

      // Determine tier based on product name
      let tier: PlanTier = PLAN_TIERS.FREE;
      if (product) {
        const productName = product.name.toUpperCase();
        if (productName.includes("PRO")) {
          tier = PLAN_TIERS.PRO;
        } else if (productName.includes("MAX")) {
          tier = PLAN_TIERS.MAX;
        }
      }

      return {
        tier,
        expireAt: trialSubscription.current_period_end,
        status: "trialing",
        productId: trialSubscription.product_id,
      };
    }

    // No active or trialing subscription found
    return {
      tier: PLAN_TIERS.FREE,
      expireAt: null,
      status: "active",
      productId: null,
    };
  }

  // Get the product to determine tier
  const product = await db.query.products.findFirst({
    where: eq(products.id, subscription.product_id),
  });

  // Determine tier based on product name
  let tier: PlanTier = PLAN_TIERS.FREE;
  if (product) {
    const productName = product.name.toUpperCase();
    if (productName.includes("PRO")) {
      tier = PLAN_TIERS.PRO;
    } else if (productName.includes("MAX")) {
      tier = PLAN_TIERS.MAX;
    }
  }

  return {
    tier,
    expireAt: subscription.current_period_end,
    status: subscription.status,
    productId: subscription.product_id,
  };
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const plan = await getUserPlan();
  return plan.tier !== PLAN_TIERS.FREE;
}

/**
 * Get all subscriptions for the current user
 */
export async function getUserSubscriptions() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userSubscriptions = await db.query.subscriptions.findMany({
    where: eq(subscriptions.user_id, session.user.id),
    orderBy: (subscriptions, { desc }) => [desc(subscriptions.created_at)],
  });

  return userSubscriptions;
}
