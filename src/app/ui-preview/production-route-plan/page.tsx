import {
  ProductionRoutePlanComposition,
} from "@/components/ui-preview/production-route-plan";

import {
  createProductionRoutePlan,
} from "@/config/storefront-production-route-plan";

export const metadata = {
  title:
    "Production Route Integration Plan | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function ProductionRoutePlanPage() {
  const plan =
    createProductionRoutePlan();

  return (
    <ProductionRoutePlanComposition
      plan={
        plan
      }
    />
  );
}
