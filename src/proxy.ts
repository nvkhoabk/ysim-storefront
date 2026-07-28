// F07A-1B_MARKET_ROUTING_V1

import { NextResponse, type NextRequest } from "next/server";

import { readMarketCookie } from "@/lib/market/market.cookie";
import {
  isMarketRoutingEnabled,
  readCountryCodeFromHeaders,
} from "@/lib/market/market.request";
import { decideMarketRouting } from "@/lib/market/market.routing";

const MARKET_REQUEST_HEADERS = {
  id: "x-ysim-market-id",
  locale: "x-ysim-locale",
  currency: "x-ysim-currency",
  source: "x-ysim-market-source",
} as const;

function addMarketRequestHeaders(
  request: NextRequest,
  market: { id: string; locale: string; currency: string },
  source: string,
): Headers {
  const headers = new Headers(request.headers);
  headers.set(MARKET_REQUEST_HEADERS.id, market.id);
  headers.set(MARKET_REQUEST_HEADERS.locale, market.locale);
  headers.set(MARKET_REQUEST_HEADERS.currency, market.currency);
  headers.set(MARKET_REQUEST_HEADERS.source, source);
  return headers;
}

function preventLocationCaching(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie, CF-IPCountry");
  return response;
}

export default function proxy(request: NextRequest) {
  const decision = decideMarketRouting({
    enabled: isMarketRoutingEnabled(),
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    cookieValue: readMarketCookie(request.headers.get("cookie")),
    countryCode: readCountryCodeFromHeaders(request.headers),
  });

  if (decision.action === "next") return NextResponse.next();

  if (decision.action === "redirect") {
    return preventLocationCaching(
      NextResponse.redirect(new URL(decision.location, request.url), 307),
    );
  }

  const destination = new URL(decision.destination, request.url);
  const response = NextResponse.rewrite(destination, {
    request: {
      headers: addMarketRequestHeaders(
        request,
        decision.market,
        decision.source,
      ),
    },
  });
  response.headers.set("x-ysim-market-id", decision.market.id);
  return preventLocationCaching(response);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|ui-preview|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
