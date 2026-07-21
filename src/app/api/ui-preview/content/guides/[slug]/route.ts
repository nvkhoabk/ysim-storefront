import {
  NextResponse,
} from "next/server";

import {
  loadGuideArticle,
  parseContentLocale,
} from "@/lib/content/integration";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

interface GuideDetailRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  request: Request,
  context:
    GuideDetailRouteContext,
) {
  try {
    const {
      slug,
    } =
      await context.params;

    const url =
      new URL(
        request.url,
      );

    const locale =
      parseContentLocale(
        url.searchParams.get(
          "locale",
        ),
      );

    const result =
      await loadGuideArticle({
        locale,
        slug,
      });

    if (!result) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Không tìm thấy Guide.",
        },
        {
          status:
            404,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success:
          true,

        sourceMode:
          result.sourceMode,

        requestedLocale:
          result.requestedLocale,

        resolvedLocale:
          result.resolvedLocale,

        usedFallback:
          result.usedFallback,

        article:
          result.page.article,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Guide detail integration failed:",
      error,
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Không thể tải Guide.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
