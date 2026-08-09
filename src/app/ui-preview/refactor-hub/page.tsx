import {
  PreviewHubComposition,
} from "@/components/ui-preview/refactor";

import {
  uiPreviewHub,
} from "@/config/storefront-ui-preview-registry";

export const metadata = {
  title:
    "UI Refactor Preview Hub | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function RefactorPreviewHubPage() {
  return (
    <PreviewHubComposition
      hub={
        uiPreviewHub
      }
    />
  );
}
