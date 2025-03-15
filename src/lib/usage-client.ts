"use client";

import {
  getRemainingUsage,
  hasAvailableUsage,
  recordUsage,
} from "@/actions/usage";
import { USAGE_TYPES } from "@/lib/usage-constants";

/**
 * 检查用户是否有可用用量并记录用量
 * @param usageType 用量类型
 * @returns 是否成功记录用量
 */
export async function checkAndRecordUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
): Promise<{
  success: boolean;
  hasAvailableUsage: boolean;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
  };
  error?: string;
}> {
  try {
    // 检查是否有可用用量
    const hasUsage = await hasAvailableUsage(usageType);
    if (!hasUsage) {
      return {
        success: false,
        hasAvailableUsage: false,
        error: "Usage limit exceeded",
      };
    }

    // 记录用量
    const success = await recordUsage(usageType);
    if (!success) {
      return {
        success: false,
        hasAvailableUsage: true,
        error: "Failed to record usage",
      };
    }

    // 获取更新后的用量数据
    const updatedUsage = await getRemainingUsage(usageType);

    return {
      success: true,
      hasAvailableUsage: true,
      usage: updatedUsage,
    };
  } catch (error) {
    console.error("Error checking and recording usage:", error);
    return {
      success: false,
      hasAvailableUsage: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * 获取用户当前用量信息
 * @param usageType 用量类型
 * @returns 用量信息
 */
export async function getClientUsage(
  usageType: string = USAGE_TYPES.FORMULA_GENERATION,
): Promise<{
  used: number;
  limit: number;
  remaining: number;
} | null> {
  try {
    return await getRemainingUsage(usageType);
  } catch (error) {
    console.error("Error getting usage:", error);
    return null;
  }
}
