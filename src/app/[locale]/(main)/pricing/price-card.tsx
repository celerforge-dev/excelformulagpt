import { getCheckoutURL } from "@/actions/lemonsqueezy";
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
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface PricingPlan {
  name: string;
  price: number;
  variantId?: number;
  description: string;
  ctaText: string;
  popular?: boolean;
  features: string[];
}

interface PriceCardProps {
  plan: PricingPlan;
}

function calculateDisplayPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
}

export function PriceCard({ plan }: PriceCardProps) {
  const { data: session } = useSession();
  const displayPrice = calculateDisplayPrice(plan.price);
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    if (!plan.variantId) return;
    if (!session?.user) {
      toast.error("Please sign in to continue.", {
        description: "You need to be signed in to create a checkout.",
      });
      return;
    }
    let checkoutUrl: string | undefined = "";

    try {
      setLoading(true);
      checkoutUrl = await getCheckoutURL(plan.variantId, true);
    } catch (error) {
      console.error("error", error);
      setLoading(false);
      toast.error("Error creating a checkout.", {
        description: "Please check the server console for more information.",
      });
    } finally {
      setLoading(false);
    }
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  }
  return (
    <Card
      className={cn(
        "rounded-lg shadow-none",
        plan.popular ? "border-primary" : "",
      )}
    >
      <div className="flex min-h-[380px] flex-col">
        <CardHeader className="flex-shrink-0 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            {plan.popular && <Badge>Most Popular</Badge>}
          </div>
          <div className="mt-6">
            <span className="text-4xl font-bold">{displayPrice}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardDescription className="mt-6 flex min-h-10 items-center">
            {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex-grow pb-0">
          <ul className="space-y-4">
            {plan.features.map((feature) => (
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
            onClick={handleClick}
            disabled={loading}
          >
            {plan.ctaText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
