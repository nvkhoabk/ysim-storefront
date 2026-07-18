import type { Metadata } from "next";

import {
  EsimPackageAssistantBanner,
} from "@/components/esim/EsimPackageAssistantBanner";

import {
  EsimCatalogShell,
} from "@/components/esim/catalog";

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

import {
  SiteContainer,
} from "@/components/layout/primitives";

export const metadata: Metadata = {
  title: "eSIM du lịch quốc tế",
  description:
    "Khám phá eSIM theo quốc gia, khu vực và toàn cầu cho hơn 200 quốc gia và vùng lãnh thổ.",
};

export default function EsimPage() {
  return (
    <>
      <AnnouncementBar />

      <Header />

      <main className="bg-slate-50">
        <section className="py-5 sm:py-7">
          <SiteContainer size="wide">
            <EsimCatalogShell />
          </SiteContainer>
        </section>

        <section className="pb-8 sm:pb-10">
          <SiteContainer size="wide">
            <EsimPackageAssistantBanner />
          </SiteContainer>
        </section>

        <FooterBenefits />
      </main>

      <Footer />
    </>
  );
}