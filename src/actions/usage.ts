"use server";

import { getUserPlan } from "@/actions/subscription";
import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/drizzle";
import { redis } from "@/lib/redis";

// Usage limits for different user types
const USAGE_LIMITS = {
  FREE: 5,
  PRO: 100,
} as const;

// Redis key patterns
const REDIS_KEYS = {
  dailyUsage: (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return `user:formula:${userId}:${today}`;
  },
  systemTotal: "system:formula:total",
} as const;

/**
 * Calculate remaining seconds until end of current day
 * Used for setting Redis key expiration
 */
export async function getRemainingSecondsToday(): Promise<number> {
  const now = new Date();
  const utcEndOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return Math.max(
    1,
    Math.floor((utcEndOfDay.getTime() - now.getTime()) / 1000),
  );
}

type UsageResult = {
  canUse: boolean;
  remainingCount: number;
  error?: string;
};

/**
 * Check if user can use formula generation
 */
export async function checkUsage(): Promise<UsageResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        canUse: false,
        remainingCount: 0,
        error: "Unauthorized",
      };
    }

    const { type: planType } = await getUserPlan();
    const dailyKey = REDIS_KEYS.dailyUsage(session?.user?.id);
    const currentUsage = parseInt((await redis.get(dailyKey)) || "0", 10);
    const limit = planType === PLANS.PRO ? USAGE_LIMITS.PRO : USAGE_LIMITS.FREE;
    const remaining = Math.max(0, limit - currentUsage);

    return {
      canUse: remaining > 0,
      remainingCount: remaining,
      error:
        remaining <= 0
          ? planType === PLANS.PRO
            ? "You've reached your daily PRO limit. Please try again tomorrow."
            : "You've reached your daily free limit. Upgrade to PRO for more."
          : undefined,
    };
  } catch (error) {
    console.error("Failed to check usage:", error);
    return {
      canUse: false,
      remainingCount: 0,
      error: "System busy, please try again later",
    };
  }
}

/**
 * Record formula generation usage
 * Increments both user's daily count and system total
 */
export async function recordUsage(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return;
    }

    const pipeline = redis.pipeline();
    const dailyKey = REDIS_KEYS.dailyUsage(session.user.id);
    const expireSeconds = getRemainingSecondsToday();

    pipeline.incr(dailyKey);
    pipeline.expire(dailyKey, await expireSeconds);
    pipeline.incr(REDIS_KEYS.systemTotal);

    await pipeline.exec();
  } catch (error) {
    console.error("Failed to record usage:", error);
  }
}

export type Usage = {
  used: number;
  remaining: number;
  limit: number;
};

/**
 * Get user's daily usage statistics
 */
export async function getUsage(): Promise<Usage> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { used: 0, remaining: 5, limit: 0 };
    }

    const { type: planType } = await getUserPlan();
    const dailyKey = REDIS_KEYS.dailyUsage(session.user.id);
    const used = parseInt((await redis.get(dailyKey)) || "0", 10);
    const limit = planType === PLANS.PRO ? USAGE_LIMITS.PRO : USAGE_LIMITS.FREE;

    return {
      used,
      remaining: Math.max(0, limit - used),
      limit,
    };
  } catch (error) {
    console.error("Failed to get usage stats:", error);
    return { used: 0, remaining: 5, limit: 0 };
  }
}

/**
 * Get system-wide total usage count
 * @returns Total number of formulas generated across all users
 */
export async function getSystemTotal(): Promise<number> {
  try {
    return parseInt((await redis.get(REDIS_KEYS.systemTotal)) || "0", 10);
  } catch (error) {
    console.error("Failed to get system total:", error);
    return 0;
  }
}
