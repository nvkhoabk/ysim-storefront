import type {
  GPayQrAccessToken,
  GPayQrTokenResult,
} from "./qr-types";

interface CacheEntry {
  token: GPayQrAccessToken;
  refreshAt: number;
}

const caches: Partial<
  Record<GPayQrAccessToken["strategy"], CacheEntry>
> = {};

const REFRESH_BUFFER_MS = 60_000;

export function getCachedGPayQrToken(
  strategy: GPayQrAccessToken["strategy"],
): GPayQrAccessToken | null {
  const entry = caches[strategy];

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.refreshAt) {
    delete caches[strategy];
    return null;
  }

  return entry.token;
}

export function setCachedGPayQrToken(
  token: GPayQrAccessToken,
): void {
  const expiresAt = new Date(token.expiresAt).getTime();

  caches[token.strategy] = {
    token,
    refreshAt: Math.max(
      Date.now(),
      expiresAt - REFRESH_BUFFER_MS,
    ),
  };
}

export function clearCachedGPayQrToken(
  strategy?: GPayQrAccessToken["strategy"],
): void {
  if (strategy) {
    delete caches[strategy];
    return;
  }

  delete caches.legacy;
  delete caches.openapi;
}

export function toSafeGPayQrTokenInfo(
  result: GPayQrTokenResult,
) {
  return {
    tokenType: result.token.tokenType,
    expiresAt: result.token.expiresAt,
    obtainedAt: result.token.obtainedAt,
    strategy: result.token.strategy,
    scope: result.token.scope,
    cached: result.cached,
  };
}
