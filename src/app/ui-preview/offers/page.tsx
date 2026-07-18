import {
  OffersHero,
  OffersSupportBenefits,
  PartnerDiscountSection,
} from "@/components/offers";

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

export default function OffersPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
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
    </main>
  );
}