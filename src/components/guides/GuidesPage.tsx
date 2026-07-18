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

import {
  GuideSupportBanner,
} from "./GuideSupportBanner";

import {
  GuidesHero,
} from "./GuidesHero";

import {
  InstallationGuide,
} from "./InstallationGuide";

import {
  PopularGuideTopics,
} from "./PopularGuideTopics";

export function GuidesPage() {
  return (
    <main className="bg-slate-50">
      <section className="py-6 sm:py-8">
        <SiteContainer size="wide">
          <GuidesHero
            content={guidesHeroContent}
            tabs={guidesTabs}
            activeTab="installation"
          />

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:mt-8 sm:px-7 sm:py-8">
            <InstallationGuide
              steps={installationGuideSteps}
            />

            <PopularGuideTopics
              topics={popularGuideTopics}
            />

            <GuideSupportBanner />
          </div>
        </SiteContainer>
      </section>
    </main>
  );
}