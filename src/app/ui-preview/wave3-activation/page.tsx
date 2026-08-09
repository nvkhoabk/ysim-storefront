import {
  Wave3ActivationComposition,
} from "@/components/ui-preview/wave3-activation";

import {
  createWave3ActivationPlan,
} from "@/config/storefront-wave3-activation";

export const metadata = {
  title:
    "Wave 3 Controlled Activation | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

export default function Wave3ActivationPage() {
  return (
    <Wave3ActivationComposition
      plan={
        createWave3ActivationPlan()
      }
    />
  );
}
