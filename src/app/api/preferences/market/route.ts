// F07A-1B_MARKET_ROUTING_V1

import { NextResponse } from "next/server";

import {
  MARKET_COOKIE_MAX_AGE_SECONDS,
  MARKET_COOKIE_NAME,
} from "@/config/markets";
import { getMarketById } from "@/lib/market/market.registry";
import {
  isMarketRoutingEnabled,
  isSecureMarketRequest,
} from "@/lib/market/market.request";
import { marketSelectionRedirectPath } from "@/lib/market/market.routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PreferenceBody = {
  readonly marketId?: unknown;
  readonly returnPath?: unknown;
};

function json(body: Record<string, unknown>, status: number): NextResponse {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function readPreferenceBody(request: Request): Promise<PreferenceBody> {
  try {
    const value = (await request.json()) as unknown;
    return typeof value === "object" && value !== null
      ? (value as PreferenceBody)
      : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  if (!isMarketRoutingEnabled()) {
    return json(
      {
        success: false,
        code: "MARKET_ROUTING_DISABLED",
      },
      503,
    );
  }

  const body = await readPreferenceBody(request);
  const marketId = typeof body.marketId === "string" ? body.marketId : "";
  const market = getMarketById(marketId);
  if (!market) {
    return json(
      {
        success: false,
        code: "INVALID_MARKET",
      },
      400,
    );
  }

  const returnPath =
    typeof body.returnPath === "string" ? body.returnPath : "/";
  const redirectPath = marketSelectionRedirectPath(market.id, returnPath);
  const response = json(
    {
      success: true,
      market: {
        id: market.id,
        locale: market.locale,
        currency: market.currency,
      },
      redirectPath,
    },
    200,
  );

  response.cookies.set(MARKET_COOKIE_NAME, market.id, {
    path: "/",
    maxAge: MARKET_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: isSecureMarketRequest(request.url, request.headers),
    httpOnly: false,
  });
  return response;
}

export async function DELETE(request: Request) {
  const response = json({ success: true, cleared: true }, 200);
  response.cookies.set(MARKET_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: isSecureMarketRequest(request.url, request.headers),
    httpOnly: false,
  });
  return response;
}
