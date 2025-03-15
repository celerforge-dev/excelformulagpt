"use server";

import { getUserPlan } from "@/actions/subscription";
import { db } from "@/db/config";
import { userUsage } from "@/db/schema";
import { auth } from "@/lib/auth";
import { USAGE_LIMITS, USAGE_TYPES } from "@/lib/usage-constants";
import { and, eq } from "drizzle-orm";

/**
 * 获取用户当前用量信息 (DB based)
 */
export async function getUserUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // 获取用户计划
  const plan = await getUserPlan();
  const usageLimit =
    USAGE_LIMITS[plan.tier][
      usageType as keyof (typeof USAGE_LIMITS)[typeof plan.tier]
    ];

  // 查找或创建用户用量记录
  let usage = await db.query.userUsage.findFirst({
    where: and(
      eq(userUsage.user_id, session.user.id),
      eq(userUsage.usage_type, usageType),
    ),
  });

  // 如果没有找到用量记录或者已经过了重置日期，创建或重置用量记录
  const now = new Date();
  if (!usage || now > usage.reset_date) {
    // 计算下个月1号的日期作为重置日期
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (!usage) {
      // 创建新的用量记录
      await db.insert(userUsage).values({
        user_id: session.user.id,
        usage_type: usageType,
        usage_count: 0,
        usage_limit: usageLimit,
        reset_date: resetDate,
      });
    } else {
      // 重置现有用量记录
      await db
        .update(userUsage)
        .set({
          usage_count: 0,
          usage_limit: usageLimit,
          reset_date: resetDate,
          updated_at: now,
        })
        .where(eq(userUsage.id, usage.id));
    }

    // 重新获取更新后的用量记录
    usage = await db.query.userUsage.findFirst({
      where: and(
        eq(userUsage.user_id, session.user.id),
        eq(userUsage.usage_type, usageType),
      ),
    });
  }

  return usage;
}

/**
 * 检查用户是否有足够的用量 (DB based)
 */
export async function hasAvailableUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
): Promise<boolean> {
  const usage = await getUserUsage(usageType);
  if (!usage) return false;

  return usage.usage_count < usage.usage_limit;
}

/**
 * 记录用户用量 (DB based)
 */
export async function recordUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  // 检查是否有可用用量
  if (!(await hasAvailableUsage(usageType))) {
    return false;
  }

  // 增加用量计数
  const usage = await getUserUsage(usageType);
  if (!usage) return false;

  await db
    .update(userUsage)
    .set({
      usage_count: usage.usage_count + 1,
      updated_at: new Date(),
    })
    .where(eq(userUsage.id, usage.id));

  return true;
}

/**
 * 获取用户剩余用量 (DB based)
 */
export async function getRemainingUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
): Promise<{ used: number; limit: number; remaining: number }> {
  const usage = await getUserUsage(usageType);

  if (!usage) {
    const plan = await getUserPlan();
    const limit =
      USAGE_LIMITS[plan.tier][
        usageType as keyof (typeof USAGE_LIMITS)[typeof plan.tier]
      ];
    return { used: 0, limit, remaining: limit };
  }

  return {
    used: usage.usage_count,
    limit: usage.usage_limit,
    remaining: Math.max(0, usage.usage_limit - usage.usage_count),
  };
}
