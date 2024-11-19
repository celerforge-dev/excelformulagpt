"use client";

import { getUserPlan } from "@/actions/subscription";
import { getRemainingSecondsToday } from "@/actions/usage";
import { PLANS, PlanType } from "@/lib/drizzle";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormula } from "./formula-context";

export function UsageDisplay() {
  const { dailyStats } = useFormula();
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

  const isPro = planType === PLANS.PRO;
  const showCredits = dailyStats.remaining <= 10 && dailyStats.remaining > 0;

  return (
    <div className="flex min-h-9 w-full items-center border-b px-3 text-sm">
      {isPro && !showCredits && (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-violet-600">
            Pro Member
          </span>
        </div>
      )}

      {showCredits ? (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-secondary-foreground">
            {dailyStats.remaining} {isPro ? "pro" : "free"} credits left
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="text-secondary-foreground">
            Refreshes in {timeLeft},{" "}
            {!isPro && (
              <span>
                <Link
                  href="/pricing"
                  className="text-black hover:text-gray-600"
                >
                  Upgrade to Pro
                </Link>{" "}
                for $1.58 to get more credits.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
