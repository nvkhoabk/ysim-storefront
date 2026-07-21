import type {
  Metadata,
} from "next";

import {
  SupportPage,
} from "@/components/support";

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
  title: "Hỗ trợ khách hàng | YSim",
  description:
    "Tìm hướng dẫn, câu hỏi thường gặp và các kênh hỗ trợ khách hàng YSim 24/7.",
};

export default function SupportRoutePage() {
  return (
    <>
      <AnnouncementBar />

      <Header />

      <SupportPage />

      <FooterBenefits />

      <Footer />
    </>
  );
}