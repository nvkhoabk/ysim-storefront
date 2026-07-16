import {
  footerExplore,
  footerPartner,
  footerSupport,
} from "@/data/footer";

import { FooterBottom } from "./FooterBottom";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { FooterNewsletter } from "./FooterNewsletter";

export function Footer() {
  return (
    <footer
      className="
        border-t
        border-green-50
        bg-gradient-to-b
        from-white
        via-green-50/30
        to-green-50/60
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-x-7
          gap-y-10
          px-5
          py-10
          sm:grid-cols-2
          sm:px-6
          lg:grid-cols-[1.6fr_0.9fr_1.15fr_1fr_1.35fr]
          lg:px-8
          lg:py-12
        "
      >
        <div className="order-1 sm:col-span-2 lg:col-span-1">
          <FooterBrand />
        </div>

        <div className="order-3 lg:order-2">
          <FooterLinks
            title="Khám phá"
            items={footerExplore}
          />
        </div>

        <div className="order-4 lg:order-3">
          <FooterLinks
            title="Hỗ trợ"
            items={footerSupport}
          />
        </div>

        <div className="order-5 lg:order-4">
          <FooterLinks
            title="Dành cho đối tác"
            items={footerPartner}
          />
        </div>

        <div className="order-2 sm:col-span-2 lg:order-5 lg:col-span-1">
          <FooterNewsletter />
        </div>
      </div>

      <FooterBottom />
    </footer>
  );
}