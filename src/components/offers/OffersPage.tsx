import {
  offersBenefits,
  offersHeroContent,
  offersHighlights,
  offersTabs,
} from "@/content/offers/offers";

import {
  offersSupportBenefits,
  partnerTiers,
} from "@/content/offers/partner-policy";

import {
  SiteContainer,
} from "@/components/layout/primitives";

import {
  OffersHero,
} from "./OffersHero";

import {
  OffersSupportBenefits,
} from "./OffersSupportBenefits";

import {
  PartnerDiscountSection,
} from "./PartnerDiscountSection";

export function OffersPage() {
  return (
    <main className="bg-slate-50">
      <section className="py-6 sm:py-8">
        <SiteContainer size="wide">
          <OffersHero
            content={offersHeroContent}
            benefits={offersBenefits}
            highlights={offersHighlights}
            tabs={offersTabs}
            activeTab="discount-policy"
          />

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8">
            <PartnerDiscountSection
              tiers={partnerTiers}
            />

            <OffersSupportBenefits
              items={offersSupportBenefits}
            />
          </div>
        </SiteContainer>
      </section>
    </main>
  );
}