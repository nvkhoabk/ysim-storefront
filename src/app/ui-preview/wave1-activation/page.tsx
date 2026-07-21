import {
  Wave1ActivationComposition,
} from "@/components/ui-preview/wave1-activation";

import {
  createWave1ActivationPlan,
} from "@/config/storefront-wave1-activation";

export const metadata = {
  title:
    "Wave 1 Controlled Activation | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function Wave1ActivationPage() {
  const plan =
    createWave1ActivationPlan();

  return (
    <Wave1ActivationComposition
      plan={
        plan
      }
    />
  );
}
