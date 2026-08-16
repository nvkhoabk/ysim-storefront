import {
  ReleaseReadinessPage,
} from "@/components/ui-preview/release-readiness";

import {
  createReleaseReadinessViewModel,
} from "@/config/storefront-release-readiness";

export const metadata = {
  title:
    "Release Readiness | YSim",
  robots: {
    index:
      false,
    follow:
      false,
  },
};

export default function Page() {
  return (
    <ReleaseReadinessPage
      readiness={
        createReleaseReadinessViewModel()
      }
    />
  );
}
