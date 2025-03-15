import { getProducts, syncProducts } from "@/actions/creem";
import { PricingSectionCards } from "@/app/[locale]/(main)/pricing/plan";

export const metadata = {
  title: "Pricing",
  description: "Pricing for the app",
};

export default async function Page() {
  let pricingProducts = await getProducts();
  if (!pricingProducts.length) {
    pricingProducts = await syncProducts(); // This will fetch from API, store, and return products
  }
  return <PricingSectionCards pricingProducts={pricingProducts} />;
}
