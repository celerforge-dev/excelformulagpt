"use client";

import { ComparisonTable } from "@/app/[locale]/(main)/pricing/comparison-table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { plans } from "@/db/schema";
import { useState } from "react";
import { PriceCard } from "./price-card";

const PRICING_TIERS = {
  FREE: "free",
  PRO: "pro",
  MAX: "max",
} as const;

type PlanTier = (typeof PRICING_TIERS)[keyof typeof PRICING_TIERS];

const planFeatures = [
  {
    type: "Core Features",
    features: [
      {
        name: "AI excel formulas generations per day",
        free: "5",
        pro: "100",
        max: "1,000",
      },
      {
        name: "Excel file upload",
        free: true,
        pro: true,
        max: true,
      },
      {
        name: "History saving",
        free: true,
        pro: true,
        max: true,
      },
    ],
  },
  {
    type: "Advanced Features",
    features: [
      {
        name: "Early access to new features",
        free: false,
        pro: false,
        max: true,
      },
    ],
  },
];

const PLAN_CONFIG = [
  {
    name: "Free",
    description: "Perfect for trying out and personal use",
    ctaText: "Start for free",
  },
  {
    key: "ExcelFormulaGPT PRO",
    name: "Pro",
    description: "Great for regular users who need more power",
    ctaText: "Upgrade to Pro",
    popular: true,
    billingPeriod: "monthly",
  },
  {
    key: "ExcelFormulaGPT PRO YEARLY",
    name: "Pro",
    description: "Great for regular users who need more power",
    ctaText: "Upgrade to Pro",
    popular: true,
    billingPeriod: "yearly",
  },
  {
    key: "ExcelFormulaGPT MAX",
    name: "Max",
    description: "Best for businesses and power users",
    ctaText: "Upgrade to Max",
    billingPeriod: "monthly",
  },
  {
    key: "ExcelFormulaGPT MAX YEARLY",
    name: "Max",
    description: "Best for businesses and power users",
    ctaText: "Upgrade to Max",
    billingPeriod: "yearly",
  },
];

function formatFeatureValue(name: string, value: string) {
  if (name.includes("per day")) {
    return `${value} generations credits / day`;
  }
  return `${name} : ${value}`;
}

// Helper function to get features for a plan
export function getPlanFeatures(planName: string): string[] {
  const tier = planName.toLowerCase() as PlanTier;
  const features = new Set<string>();

  // Add inheritance message first
  if (tier === PRICING_TIERS.PRO) {
    features.add("Everything in Free");
  } else if (tier === PRICING_TIERS.MAX) {
    features.add("Everything in Pro");
  }

  // Only add unique features for current tier
  planFeatures.forEach((group) => {
    group.features.forEach((feature) => {
      const value = feature[tier];
      if (typeof value === "string") {
        features.add(formatFeatureValue(feature.name, value));
      } else if (
        value &&
        !(tier === PRICING_TIERS.PRO && feature.free) &&
        !(tier === PRICING_TIERS.MAX && feature.pro)
      ) {
        features.add(feature.name);
      }
    });
  });

  return Array.from(features);
}

export function PricingSectionCards({
  pricingPlans,
}: {
  pricingPlans: (typeof plans.$inferSelect)[];
}) {
  const [isYearly, setIsYearly] = useState(true);

  // Filter config based on billing period
  const filteredConfig = PLAN_CONFIG.filter(
    (config) =>
      !config.billingPeriod || // Include Free plan (no billing period)
      (isYearly
        ? config.billingPeriod === "yearly"
        : config.billingPeriod === "monthly"),
  );

  // Map through config to find matching plans
  const mergedPlans = filteredConfig.map((config) => {
    const plan = pricingPlans.find(
      (p) =>
        config.key === p.name || (config.name === "Free" && p.name === "Free"),
    );

    if (!plan && config.name !== "Free") {
      console.warn(`No plan found for config: ${config.key}`);
    }
    const price = parseFloat(plan?.price || "0") / 100;

    return {
      name: config.name,
      price: config.billingPeriod === "yearly" ? price / 12 : price,
      description: config.description,
      ctaText: config.ctaText,
      popular: config.popular || false,
      features: getPlanFeatures(config.name),
      variantId: plan?.variantId,
    };
  });

  return (
    <div className="container py-24 lg:py-32">
      {/* Title Section */}
      <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
        <h2 className="mb-4 text-4xl font-bold">Pricing</h2>
        <p className="text-xl text-muted-foreground">
          Whatever your status, our offers evolve according to your needs.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-10 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <Label htmlFor="billing-toggle" className="text-lg">
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className="relative text-lg">
            Yearly
            <Badge className="absolute -right-24 -top-8 bg-black text-white">
              SAVE UP TO 20%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-5xl">
        <div className="grid h-full gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mergedPlans.map((plan) => (
            <div key={plan.name} className="h-full">
              <PriceCard plan={plan} />
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mt-20 hidden lg:mt-32 lg:block">
        <div className="mb-16 text-center">
          <h3 className="text-3xl font-bold">Compare plans</h3>
        </div>
        <ComparisonTable
          planFeatures={planFeatures}
          pricingTiers={PRICING_TIERS}
        />
      </div>
    </div>
  );
}
