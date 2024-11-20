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

interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  ctaText: string;
  popular?: boolean;
  features: string[];
}

interface PriceCardProps {
  plan: PricingPlan;
  isYearly: boolean;
}

function calculateDisplayPrice(
  price: { monthly: number; yearly: number },
  isYearly: boolean,
): string {
  if (price.monthly === 0) return "Free";
  const amount = isYearly ? (price.yearly / 12).toFixed(2) : price.monthly;
  return `$${amount}`;
}

export function PriceCard({ plan, isYearly }: PriceCardProps) {
  const displayPrice = calculateDisplayPrice(plan.price, isYearly);
  console.log(plan.name, displayPrice, plan.price.monthly);
  return (
    <Card
      className={cn(
        "rounded-lg shadow-none",
        plan.popular ? "border-primary" : "",
      )}
    >
      <div className="flex min-h-[430px] flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            {plan.popular && <Badge>Most Popular</Badge>}
          </div>
          <CardDescription className="mt-2">{plan.description}</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">{displayPrice}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-0">
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
          >
            {plan.ctaText}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
