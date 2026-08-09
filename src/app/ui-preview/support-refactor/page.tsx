import {
  SupportPageComposition,
} from "@/components/support/refactor";

import {
  supportPreviewPage,
} from "@/config/storefront-support-preview";

export const metadata = {
  title:
    "Support & Device Compatibility Preview | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function SupportRefactorPreviewPage() {
  return (
    <SupportPageComposition
      page={
        supportPreviewPage
      }
      cartCount={2}
    />
  );
}
