"use client";

import { Progress } from "@/components/ui/progress";
import { getClientUsage } from "@/lib/usage-client";
import { USAGE_TYPES } from "@/lib/usage-constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface UsageDisplayProps {
  usageType?: string;
  className?: string;
}

export function UsageDisplay({
  usageType = USAGE_TYPES.FORMULA_GENERATION,
  className,
}: UsageDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const data = await getClientUsage(usageType);
        setUsageData(data);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [usageType]);

  if (loading) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        Loading usage...
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        Usage data unavailable
      </div>
    );
  }

  const { used, limit, remaining } = usageData;
  const usagePercentage = Math.round((used / limit) * 100);
  const isLowUsage = remaining / limit < 0.2; // Less than 20% remaining

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Formula Generation</span>
        <span
          className={
            isLowUsage
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          }
        >
          {remaining} / {limit} remaining
        </span>
      </div>
      <Progress
        value={usagePercentage}
        className="h-2 w-full"
        indicatorClassName={isLowUsage ? "bg-destructive" : undefined}
      />
      {isLowUsage && (
        <p className="text-xs text-destructive">
          Low usage remaining. Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}

export function UsageMenuItem() {
  return (
    <div className="px-2 py-2">
      <UsageDisplay />
    </div>
  );
}
