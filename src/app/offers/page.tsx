import type {
  Metadata,
} from "next";

import {
  OffersPage,
} from "@/components/offers";

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
  title: "Ưu đãi đối tác | YSim",
  description:
    "Khám phá chính sách chiết khấu, thưởng doanh số và quyền lợi dành cho đối tác YSim.",
};

export default function OffersRoutePage() {
  return (
    <>
      <AnnouncementBar />

      <Header />

      <OffersPage />

      <FooterBenefits />

      <Footer />
    </>
  );
}