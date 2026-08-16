import {
  DestinationPageComposition,
} from "@/components/destination/refactor";

import type {
  DestinationRouteCandidateViewModel,
} from "@/types/view-models/destination-route-candidate";

import type {
  DestinationRouteSelectionViewModel,
} from "@/types/view-models/destination-page";

import {
  DestinationRouteCandidateNotice,
} from "./DestinationRouteCandidateNotice";

export function DestinationRouteCandidatePage({
  candidate,
  initialSelection,
}: {
  candidate:
    DestinationRouteCandidateViewModel;
  initialSelection?:
    DestinationRouteSelectionViewModel;
}) {
  return (
    <>
      <DestinationPageComposition
        page={
          candidate.page
        }
        cartCount={2}
        initialSelection={
          initialSelection
        }
      />

      <DestinationRouteCandidateNotice
        candidate={
          candidate
        }
      />
    </>
  );
}
