"use client";

import { getUserPlan } from "@/actions/subscription";
import { getRemainingSecondsToday } from "@/actions/usage";
import { PLANS, PlanType } from "@/lib/drizzle";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormula } from "./formula-context";

type StatusDisplayProps = {
  indicator: "success" | "error" | "loading";
  children: React.ReactNode;
};

function StatusDisplay({ indicator, children }: StatusDisplayProps) {
  const colors = {
    loading: "bg-gray-300 animate-pulse",
    success: "bg-emerald-500",
    error: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${colors[indicator]}`} />
      <span className="text-secondary-foreground">{children}</span>
    </div>
  );
}

export function UsageDisplay() {
  const { usage } = useFormula();
  const { data: session } = useSession();
  const [planType, setPlanType] = useState<PlanType>(PLANS.FREE);
  const [timeLeft, setTimeLeft] = useState<string>("0h 0m");

  useEffect(() => {
    if (session?.user?.id) {
      getUserPlan().then((plan) => setPlanType(plan.type));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    async function updateTime() {
      const seconds = await getRemainingSecondsToday();
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      setTimeLeft(`${hours}h ${minutes}m`);
    }

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!usage) {
    return <StatusDisplay indicator="loading">Loading usage...</StatusDisplay>;
  }

  const isPro = planType === PLANS.PRO;
  const showCredits = usage.remaining <= 10 && usage.remaining > 0;

  return (
    <>
      {isPro && !showCredits && (
        <div className="mr-2 flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-violet-600">
            Pro Member
          </span>
        </div>
      )}
      {showCredits && (
        <StatusDisplay indicator="success">
          {usage.remaining} {isPro ? "pro" : "free"} credits left
        </StatusDisplay>
      )}
      {!isPro && !showCredits && (
        <StatusDisplay indicator="error">Refreshes in {timeLeft}</StatusDisplay>
      )}
      {!isPro && (
        <span>
          ,{" "}
          <Link href="/pricing" className="text-black hover:text-gray-600">
            Upgrade to Pro
          </Link>{" "}
          for $1.58 to get more credits.
        </span>
      )}
    </>
  );
}
