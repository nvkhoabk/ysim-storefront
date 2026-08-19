// F07A-1B_MARKET_ROUTING_R5_LOCALIZED_ROUTES

import { NextResponse, type NextRequest } from "next/server";

import { readMarketCookie } from "@/lib/market/market.cookie";
import {
  isMarketRoutingEnabled,
  marketInternalToken,
  readCountryCodeFromHeaders,
  stripUntrustedYsimHeaders,
} from "@/lib/market/market.request";
import { getMarketByLocale } from "@/lib/market/market.registry";
import {
  decideMarketRouting,
  localizePathname,
  stripMarketLocale,
} from "@/lib/market/market.routing";
import { decideProductionExecutionGate } from "@/lib/runtime/production-execution-gate";
import {
  MARKET_REQUEST_HEADERS,
  PUBLIC_LOCALE_ROUTE_HEADER,
} from "@/i18n/runtime/runtime.types";

function addMarketRequestHeaders(
  requestHeaders: Headers,
  publicPathname: string,
  locale: string,
): Headers {
  const market = getMarketByLocale(locale);
  if (!market) {
    throw new Error(`PUBLIC_LOCALE_ROUTE_INVALID:${locale}`);
  }

  const headers = new Headers(requestHeaders);
  headers.set(PUBLIC_LOCALE_ROUTE_HEADER, market.locale);
  headers.set(MARKET_REQUEST_HEADERS.id, market.id);
  headers.set(MARKET_REQUEST_HEADERS.locale, market.locale);
  headers.set(MARKET_REQUEST_HEADERS.currency, market.currency);
  headers.set(MARKET_REQUEST_HEADERS.source, "path");
  headers.set(MARKET_REQUEST_HEADERS.publicPathname, publicPathname);
  return headers;
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
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/ui-preview" ||
    pathname.startsWith("/ui-preview/") ||
    pathname === "/api/ui-preview" ||
    pathname.startsWith("/api/ui-preview/")
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const executionGate = decideProductionExecutionGate({
    nodeEnvironment: process.env.NODE_ENV,
    pathname,
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

  if (pathname.startsWith("/api/")) {
    return continueWithSanitizedHeaders(sanitizedHeaders);
  }

  const localized = stripMarketLocale(pathname);
  if (localized.locale) {
    return continueWithSanitizedHeaders(
      addMarketRequestHeaders(sanitizedHeaders, pathname, localized.locale),
    );
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return continueWithSanitizedHeaders(sanitizedHeaders);
  }

  const routingEnabled = isMarketRoutingEnabled();
  const internalToken = marketInternalToken();

  if (routingEnabled && internalToken === null) {
    return NextResponse.json(
      {
        success: false,
        code: "MARKET_ROUTING_CONFIGURATION_INVALID",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (routingEnabled) {
    const decision = decideMarketRouting({
      enabled: true,
      pathname,
      search: request.nextUrl.search,
      cookieValue: readMarketCookie(request.headers.get("cookie")),
      countryCode: readCountryCodeFromHeaders(request.headers),
    });

    if (decision.action !== "redirect") {
      return NextResponse.json(
        {
          success: false,
          code: "MARKET_ROUTING_DECISION_INVALID",
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return preventLocationCaching(
      NextResponse.redirect(new URL(decision.location, request.url), 307),
    );
  }

  const location = `${localizePathname("vi", pathname)}${request.nextUrl.search}`;
  return preventLocationCaching(
    NextResponse.redirect(new URL(location, request.url), 308),
  );
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next(?:/|$)|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
