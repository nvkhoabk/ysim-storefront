// F07A-1B_MARKET_ROUTING_R4

import { NextResponse, type NextRequest } from "next/server";

import { readMarketCookie } from "@/lib/market/market.cookie";
import {
  isInternalMarketRewrite,
  isMarketRoutingEnabled,
  MARKET_INTERNAL_REWRITE_HEADER,
  MARKET_INTERNAL_TOKEN_HEADER,
  marketInternalToken,
  readCountryCodeFromHeaders,
  stripUntrustedYsimHeaders,
} from "@/lib/market/market.request";
import { buildInternalMarketRewriteUrl } from "@/lib/market/market.rewrite";
import { decideMarketRouting } from "@/lib/market/market.routing";
import { decideProductionExecutionGate } from "@/lib/runtime/production-execution-gate";
import { MARKET_REQUEST_HEADERS } from "@/i18n/runtime/runtime.types";

function addMarketRequestHeaders(
  requestHeaders: Headers,
  publicPathname: string,
  market: { id: string; locale: string; currency: string },
  source: string,
  token: string,
): Headers {
  const headers = new Headers(requestHeaders);
  headers.set(MARKET_INTERNAL_REWRITE_HEADER, "1");
  headers.set(MARKET_INTERNAL_TOKEN_HEADER, token);
  headers.set(MARKET_REQUEST_HEADERS.id, market.id);
  headers.set(MARKET_REQUEST_HEADERS.locale, market.locale);
  headers.set(MARKET_REQUEST_HEADERS.currency, market.currency);
  headers.set(MARKET_REQUEST_HEADERS.source, source);
  headers.set(MARKET_REQUEST_HEADERS.publicPathname, publicPathname);
  return headers;
}

function continueInternalRewrite(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers);
  headers.delete(MARKET_INTERNAL_REWRITE_HEADER);
  return NextResponse.next({ request: { headers } });
}

function continueWithSanitizedHeaders(headers: Headers): NextResponse {
  return NextResponse.next({ request: { headers } });
}

function preventLocationCaching(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie, CF-IPCountry");
  return response;
}

export default function proxy(request: NextRequest) {
  const sanitizedHeaders = stripUntrustedYsimHeaders(request.headers);
  const executionGate = decideProductionExecutionGate({
    nodeEnvironment: process.env.NODE_ENV,
    pathname: request.nextUrl.pathname,
    method: request.method,
  });

  if (!executionGate.allowed) {
    return NextResponse.json(
      {
        success: false,
        code: executionGate.code,
        capability: executionGate.capability,
        requiredFlags: executionGate.requiredFlags,
        missingFlags: executionGate.missingFlags,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return continueWithSanitizedHeaders(sanitizedHeaders);
  }

  // A localized URL is rewritten once to the existing unprefixed route.
  // Next.js may evaluate Proxy again for that internal rewrite. The marker
  // prevents the second pass from resolving cookie/IP and redirecting away
  // from the locale explicitly selected in the URL.
  if (isInternalMarketRewrite(request.headers)) {
    return continueInternalRewrite(request);
  }

  const token = marketInternalToken();
  const routingEnabled = isMarketRoutingEnabled() && token !== null;

  const decision = decideMarketRouting({
    enabled: routingEnabled,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    cookieValue: readMarketCookie(request.headers.get("cookie")),
    countryCode: readCountryCodeFromHeaders(request.headers),
  });

  if (decision.action === "next") {
    return continueWithSanitizedHeaders(sanitizedHeaders);
  }

  if (decision.action === "redirect") {
    return preventLocationCaching(
      NextResponse.redirect(new URL(decision.location, request.url), 307),
    );
  }

  const destination = buildInternalMarketRewriteUrl(
    request.url,
    decision.destination,
  );
  const response = NextResponse.rewrite(destination, {
    request: {
      headers: addMarketRequestHeaders(
        sanitizedHeaders,
        request.nextUrl.pathname,
        decision.market,
        decision.source,
        token as string,
      ),
    },
  });
  response.headers.set("x-ysim-market-id", decision.market.id);
  return preventLocationCaching(response);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|ui-preview|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
