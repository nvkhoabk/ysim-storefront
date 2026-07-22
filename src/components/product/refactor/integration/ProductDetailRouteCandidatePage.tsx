import type {
  ProductDetailRouteCandidateViewModel,
} from "@/types/view-models/product-detail-route-candidate";

import {
  ProductDetailCandidateClient,
} from "./ProductDetailCandidateClient";

import {
  ProductDetailRouteCandidateNotice,
} from "./ProductDetailRouteCandidateNotice";

export function ProductDetailRouteCandidatePage({
  candidate,
}: {
  candidate:
    ProductDetailRouteCandidateViewModel;
}) {
  return (
    <ProductDetailCandidateClient
      candidate={
        candidate
      }
      diagnostics={
        <ProductDetailRouteCandidateNotice
          candidate={
            candidate
          }
        />
      }
    />
  );
}
