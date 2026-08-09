/* YSIM_PACKAGE_38_V3_LEGACY_SNAPSHOT */
import type {
  Metadata,
} from "next";

import {
  DestinationPage,
} from "@/components/destination";

import {
  AnnouncementBar,
} from "@/components/layout/AnnouncementBar";

import {
  Header,
} from "@/components/layout/Header";

import {
  FooterBenefits,
} from "@/components/layout/FooterBenefits";

import {
  Footer,
} from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title:
    "Điểm đến eSIM quốc tế | YSim",
  description:
    "Khám phá eSIM cho hơn 200 quốc gia và vùng lãnh thổ. Tìm kiếm, so sánh thời hạn, dung lượng và giá gói eSIM phù hợp cho chuyến đi của bạn.",
};

export default function DestinationsPage() {
  return (
    <>
      <AnnouncementBar />

      <Header />

      <DestinationPage />

      <FooterBenefits />

      <Footer />
    </>
  );
}