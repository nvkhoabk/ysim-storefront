import {
  NextResponse,
} from "next/server";

import {
  loadGuideLanding,
  parseContentLocale,
} from "@/lib/content/integration";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: Request,
) {
  try {
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

    const category =
      url.searchParams.get(
        "category",
      ) ||
      undefined;

    const result =
      await loadGuideLanding({
        locale,
        category,
      });

    return NextResponse.json(
      {
        success:
          true,

        sourceMode:
          result.sourceMode,

        requestedLocale:
          result.requestedLocale,

        articles:
          result.page
            .articles,
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
      "Guide list integration failed:",
      error,
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách Guide.",
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
