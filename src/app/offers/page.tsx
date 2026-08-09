/* YSIM_PACKAGE_39_V2_ROUTE:offers-partner-program */

import type {
  Metadata,
} from "next";

import {
  ProductionOffersComposition,
} from "@/components/secondary-routes/production";

export const metadata:
  Metadata = {
    title:
      "Chương trình ưu đãi đối tác | YSim",
    description:
      "Chính sách chiết khấu, thưởng doanh số và quyền lợi dành cho đối tác YSim.",
    alternates: {
      canonical:
        "/offers",
    },
  };

export default function Page() {
  return (
    <ProductionOffersComposition />
  );
}
