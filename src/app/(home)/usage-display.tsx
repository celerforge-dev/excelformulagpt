"use client";

import { getRemainingSecondsToday } from "@/actions/usage";
import { PLAN_TIERS } from "@/db/schema";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormula } from "./formula-context";

export function UsageDisplay() {
  const { usage, tier } = useFormula();
  const [timeLeft, setTimeLeft] = useState<string>("0h 0m");

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
    return <>Loading usage...</>;
  }

  const isPremium = tier === PLAN_TIERS.PRO || tier === PLAN_TIERS.MAX;
  const showCredits = usage.remaining <= 10 && usage.remaining > 0;

  return (
    <>
      {isPremium && (
        <div className="mr-2 flex items-center gap-1">
          <span className="text-xs font-medium text-violet-600">
            {`${tier.toUpperCase()} Member`}
          </span>
        </div>
      )}
      {showCredits && (
        <span>
          {usage.remaining} credits left, refreshes in {timeLeft}.
        </span>
      )}
      {!isPremium && (
        <span>
          &nbsp;
          <Link href="/pricing" className="text-violet-600 hover:text-gray-600">
            Upgrade to Pro
          </Link>
          &nbsp;for $1.58 to get more credits.
        </span>
      )}
    </>
  );
}
