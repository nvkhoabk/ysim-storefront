import {
  GuideSupportBanner,
  GuidesHero,
  InstallationGuide,
  PopularGuideTopics,
} from "@/components/guides";

import {
  guidesHeroContent,
  guidesTabs,
} from "@/content/guides/guides";

import {
  installationGuideSteps,
} from "@/content/guides/installation";

import {
  popularGuideTopics,
} from "@/content/guides/topics";

import {
  SiteContainer,
} from "@/components/layout/primitives";

export default function GuidesPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <SiteContainer size="wide">
        <GuidesHero
          content={guidesHeroContent}
          tabs={guidesTabs}
          activeTab="installation"
        />

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8">
          <InstallationGuide
            steps={installationGuideSteps}
          />

          <PopularGuideTopics
            topics={popularGuideTopics}
          />

          <GuideSupportBanner />
        </div>
      </SiteContainer>
    </main>
  );
}