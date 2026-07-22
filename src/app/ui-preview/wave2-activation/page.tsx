import {
  Wave2ActivationComposition,
} from "@/components/ui-preview/wave2-activation";

import {
  createWave2ActivationPlan,
} from "@/config/storefront-wave2-activation";

export const metadata = {
  title:
    "Wave 2 Controlled Activation | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function Wave2ActivationPage() {
  return (
    <Wave2ActivationComposition
      plan={
        createWave2ActivationPlan()
      }
    />
  );
}
