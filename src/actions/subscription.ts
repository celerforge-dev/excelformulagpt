"use server";

import { db } from "@/db/config";
import { PLAN_TIERS, PlanTier, subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, gte, lte } from "drizzle-orm";

interface UserPlan {
  tier: PlanTier;
  expireAt: Date | null;
  status: string;
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
    };
  }

  const now = new Date().toISOString();

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, "active"),
      lte(subscriptions.renewsAt, now),
      gte(subscriptions.endsAt, now),
    ),
    with: {
      plan: true,
    },
  });
  const subscription1 = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, session.user.id),
  });
  const subscription2 = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, "active"),
    ),
  });
  const subscription3 = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, "active"),
      lte(subscriptions.renewsAt, now),
    ),
  });
  console.log("subscription", subscription);
  console.log("subscription1", subscription1);
  console.log("subscription2", subscription2);
  console.log("subscription3", subscription3);

  if (!subscription) {
    return {
      tier: PLAN_TIERS.FREE,
      expireAt: null,
      status: "active",
    };
  }

  return {
    tier: subscription.plan.tier as PlanTier,
    expireAt: subscription.endsAt ? new Date(subscription.endsAt) : null,
    status: subscription.status,
  };
}
