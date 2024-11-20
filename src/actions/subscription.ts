"use server";

import { auth } from "@/lib/auth";
import { PLANS, PlanType, subscriptions } from "@/lib/drizzle";
import { db } from "@/lib/drizzle.config";

import { and, eq, gte, lte } from "drizzle-orm";

interface UserPlan {
  type: PlanType;
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
      type: PLANS.FREE,
      expireAt: null,
      status: "active",
    };
  }

  const now = new Date();

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, "active"),
      lte(subscriptions.startAt, now),
      gte(subscriptions.expireAt, now),
    ),
  });

  if (!subscription) {
    return {
      type: PLANS.FREE,
      expireAt: null,
      status: "active",
    };
  }

  return {
    type: subscription.planType as PlanType,
    expireAt: subscription.expireAt,
    status: subscription.status,
  };
}

/**
 * Create or update user subscription
 */
export async function updateUserSubscription(params: {
  planType: PlanType;
  startAt?: Date;
  expireAt?: Date;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const { planType, startAt = new Date(), expireAt } = params;

  await db.insert(subscriptions).values({
    userId: session.user.id,
    planType,
    startAt,
    expireAt,
    status: "active",
  });
}
