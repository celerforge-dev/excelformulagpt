import { PLAN_TIERS } from "@/db/schema";

// 用量类型常量
export const USAGE_TYPES = {
  FORMULA_GENERATION: "formula_generation",
} as const;

// 不同计划的用量限制
export const USAGE_LIMITS = {
  [PLAN_TIERS.FREE]: {
    [USAGE_TYPES.FORMULA_GENERATION]: 5,
  },
  [PLAN_TIERS.PRO]: {
    [USAGE_TYPES.FORMULA_GENERATION]: 1000,
  },
  [PLAN_TIERS.MAX]: {
    [USAGE_TYPES.FORMULA_GENERATION]: 10000,
  },
} as const;
