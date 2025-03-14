import { Icons } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Feature {
  name: string;
  [key: string]: string | boolean;
}

interface FeatureType {
  type: string;
  features: Feature[];
}

interface ComparisonTableProps {
  planFeatures: FeatureType[];
  pricingTiers: Record<string, string>;
}

export function ComparisonTable({
  planFeatures,
  pricingTiers,
}: ComparisonTableProps) {
  return (
    <Table className="hidden lg:table">
      <TableHeader>
        <TableRow className="bg-muted hover:bg-muted">
          <TableHead className="w-3/12 text-primary">Plans</TableHead>
          {Object.values(pricingTiers).map((tier) => (
            <TableHead
              key={tier}
              className="w-2/12 text-center text-lg font-medium text-primary"
            >
              {tier}
            </TableHead>
          ))}
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
              {Object.values(pricingTiers).map((tier) => (
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
