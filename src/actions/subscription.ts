"use server";

import { db } from "@/db/config";
import { PLAN_TIERS, PlanTier, subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

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

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, "active"),
    ),
    with: {
      plan: true,
    },
  });

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
