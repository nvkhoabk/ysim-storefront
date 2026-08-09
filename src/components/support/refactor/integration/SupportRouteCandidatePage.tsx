import {
  SupportPageComposition,
} from "@/components/support/refactor";

import type {
  SupportRouteCandidateViewModel,
} from "@/types/view-models/support-route-candidate";

import {
  SupportRouteCandidateNotice,
} from "./SupportRouteCandidateNotice";

export function SupportRouteCandidatePage({
  candidate,
}: {
  candidate:
    SupportRouteCandidateViewModel;
}) {
  return (
    <>
      <SupportPageComposition
        page={
          candidate.page
        }
        cartCount={2}
      />

      <SupportRouteCandidateNotice
        candidate={
          candidate
        }
      />
    </>
  );
}
