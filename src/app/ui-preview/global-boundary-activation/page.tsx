import {
  GlobalBoundaryActivationPage,
} from "@/components/ui-preview/global-boundary-activation";

import {
  createGlobalBoundaryActivationPlan,
} from "@/config/storefront-global-boundary-activation";

export const metadata = {
  title:
    "Global Boundary Activation | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function Page() {
  return (
    <GlobalBoundaryActivationPage
      plan={
        createGlobalBoundaryActivationPlan()
      }
    />
  );
}
