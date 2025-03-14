import { syncPlans } from "@/actions/lemonsqueezy";
import { PricingSectionCards } from "@/app/[locale]/(main)/pricing/plan";
import { db } from "@/db/config";
import { plans } from "@/db/schema";

export const metadata = {
  title: "Pricing",
  description: "Pricing for the app",
};

export default async function Page() {
  let pricingPlans = await db.select().from(plans);
  if (!pricingPlans.length) {
    pricingPlans = await syncPlans();
  }
  return <PricingSectionCards pricingPlans={pricingPlans} />;
}
