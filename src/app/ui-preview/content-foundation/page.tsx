import {
  ArticlePageComposition,
  ContentLandingComposition,
} from "@/components/content/refactor";

import {
  contentPreviewArticlePage,
  contentPreviewLanding,
} from "@/config/storefront-content-preview";

export const metadata = {
  title:
    "WordPress Content Foundation | YSim",

  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentFoundationPreviewPage() {
  return (
    <>
      <ContentLandingComposition
        page={
          contentPreviewLanding
        }
        cartCount={2}
      />

      <div className="border-t-8 border-[var(--ysim-color-brand-100)]" />

      <ArticlePageComposition
        page={
          contentPreviewArticlePage
        }
        cartCount={2}
      />
    </>
  );
}
