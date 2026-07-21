import type {
  Metadata,
} from "next";

import {
  GuidesPage,
} from "@/components/guides";

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
  title: "Hướng dẫn sử dụng eSIM | YSim",
  description:
    "Hướng dẫn mua, nhận, cài đặt và sử dụng eSIM YSim trên iPhone, iPad và Android.",
};

export default function GuidesRoutePage() {
  return (
    <>
      <AnnouncementBar />

      <Header />

      <GuidesPage />

      <FooterBenefits />

      <Footer />
    </>
  );
}