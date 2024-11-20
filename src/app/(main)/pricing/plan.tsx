"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PRICING_TIERS = {
  FREE: "free",
  PRO: "pro",
  MAX: "max",
} as const;

type PlanTier = (typeof PRICING_TIERS)[keyof typeof PRICING_TIERS];

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  max: boolean | string;
}

interface PlanFeature {
  type: string;
  features: Feature[];
}

export const planFeatures: PlanFeature[] = [
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

interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  ctaText: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Perfect for trying out and personal use",
    ctaText: "Start for free",
  },
  {
    name: "Pro",
    price: {
      monthly: 1.98,
      yearly: 19.8,
    },
    description: "Great for regular users who need more power",
    ctaText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Max",
    price: {
      monthly: 7.98,
      yearly: 79.8,
    },
    description: "Best for businesses and power users",
    ctaText: "Upgrade to Max",
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

function calculateDisplayPrice(
  price: { monthly: number; yearly: number },
  isYearly: boolean,
): string {
  if (price.monthly === 0) return "Free";
  const amount = isYearly ? (price.yearly / 12).toFixed(2) : price.monthly;
  return `$${amount}`;
}

function PriceCard({
  plan,
  isYearly,
}: {
  plan: PricingPlan;
  isYearly: boolean;
}) {
  const displayPrice = calculateDisplayPrice(plan.price, isYearly);

  return (
    <Card
      className={cn(
        "rounded-lg shadow-none",
        plan.popular ? "border-primary" : "",
      )}
    >
      <div className="flex min-h-[430px] flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="mb-2 text-xl">
            <div className="relative flex items-center gap-2">
              {plan.name}
              {plan.popular && (
                <Badge className="uppercase">Most popular</Badge>
              )}
            </div>
          </CardTitle>
          <div className="mb-2 min-h-24">
            <span className="text-6xl font-bold">{displayPrice}</span>
            <span className="ml-1 text-sm text-muted-foreground">/month</span>
            {isYearly && (
              <div className="mt-3 text-sm text-muted-foreground">
                {plan.name === "Free"
                  ? "Free forever, no credit card required"
                  : `Billed $${plan.price.yearly}/year`}
              </div>
            )}
          </div>
          <CardDescription className="min-h-12 text-base">
            {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-0">
          <ul className="space-y-4">
            {getPlanFeatures(plan.name).map((feature) => (
              <li key={feature} className="flex items-center">
                <Icons.circleCheck className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-base text-muted-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex-shrink-0 pt-6">
          <Button
            className="w-full text-base"
            variant={plan.name === "Free" ? "outline" : "default"}
          >
            {plan.ctaText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

function ComparisonTable() {
  return (
    <Table className="hidden lg:table">
      <TableHeader>
        <TableRow className="bg-muted hover:bg-muted">
          <TableHead className="w-3/12 text-primary">Plans</TableHead>
          <TableHead className="w-2/12 text-center text-lg font-medium text-primary">
            Free
          </TableHead>
          <TableHead className="w-2/12 text-center text-lg font-medium text-primary">
            Pro
          </TableHead>
          <TableHead className="w-2/12 text-center text-lg font-medium text-primary">
            Max
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {planFeatures.flatMap((featureType) => [
          <TableRow key={`${featureType.type}-header`} className="bg-muted/50">
            <TableCell colSpan={4} className="font-bold">
              {featureType.type}
            </TableCell>
          </TableRow>,
          ...featureType.features.map((feature) => (
            <TableRow
              key={`${featureType.type}-${feature.name}`}
              className="text-muted-foreground"
            >
              <TableCell>{feature.name}</TableCell>
              {Object.values(PRICING_TIERS).map((tier: PlanTier) => (
                <TableCell key={tier}>
                  <div className="mx-auto w-min">
                    {typeof feature[tier] === "string" ? (
                      <span>{feature[tier]}</span>
                    ) : feature[tier] ? (
                      <Icons.check className="h-5 w-5" />
                    ) : (
                      <Icons.minus className="h-5 w-5" />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          )),
        ])}
      </TableBody>
    </Table>
  );
}

export default function PricingSectionCards() {
  const [isYearly, setIsYearly] = useState(true);

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
            <Badge className="absolute -right-24 -top-8 w-40 bg-black text-white">
              GET 2 MONTHS FREE
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-5xl">
        <div className="grid h-full gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="h-full">
              <PriceCard plan={plan} isYearly={isYearly} />
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mt-20 lg:mt-32">
        <div className="mb-16 text-center">
          <h3 className="text-3xl font-bold">Compare plans</h3>
        </div>

        <ComparisonTable />
      </div>
    </div>
  );
}
