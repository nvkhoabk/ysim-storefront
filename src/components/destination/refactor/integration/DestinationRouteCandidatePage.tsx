import {
  DestinationPageComposition,
} from "@/components/destination/refactor";

import type {
  DestinationRouteCandidateViewModel,
} from "@/types/view-models/destination-route-candidate";

import {
  DestinationRouteCandidateNotice,
} from "./DestinationRouteCandidateNotice";

export function DestinationRouteCandidatePage({
  candidate,
}: {
  candidate:
    DestinationRouteCandidateViewModel;
}) {
  return (
    <>
      <DestinationPageComposition
        page={
          candidate.page
        }
        cartCount={2}
      />

      <DestinationRouteCandidateNotice
        candidate={
          candidate
        }
      />
    </>
  );
}
