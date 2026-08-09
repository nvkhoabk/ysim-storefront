import {
  ContentLandingComposition,
} from "@/components/content/refactor";

import {
  loadGuideLanding,
  parseContentLocale,
} from "@/lib/content/integration";

export const metadata = {
  title:
    "Guide Integration Preview | YSim",

  robots: {
    index:
      false,
    follow:
      false,
  },
};

export const dynamic =
  "force-dynamic";

interface GuideIntegrationPageProps {
  searchParams: Promise<{
    locale?: string;
    category?: string;
  }>;
}

export default async function GuideIntegrationPage({
  searchParams,
}: GuideIntegrationPageProps) {
  const params =
    await searchParams;

  const locale =
    parseContentLocale(
      params.locale,
    );

  const result =
    await loadGuideLanding({
      locale,

      category:
        params.category,
    });

  return (
    <ContentLandingComposition
      page={
        result.page
      }
      cartCount={2}
    />
  );
}
