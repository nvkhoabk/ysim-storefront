import {
  HomePageComposition,
} from "@/components/home/refactor";

import type {
  HomeRouteCandidateViewModel,
} from "@/types/view-models/home-route-candidate";

import {
  HomeRouteCandidateNotice,
} from "./HomeRouteCandidateNotice";

export function HomeRouteCandidatePage({
  candidate,
}: {
  candidate:
    HomeRouteCandidateViewModel;
}) {
  return (
    <>
      <HomePageComposition
        page={
          candidate.page
        }
        cartCount={2}
      />

      <HomeRouteCandidateNotice
        candidate={
          candidate
        }
      />
    </>
  );
}
