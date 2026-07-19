import type {
  GPayAccessToken,
} from "./types";

interface GPayTokenCacheEntry {
  token: GPayAccessToken;
  refreshAtTimestamp: number;
}

let tokenCache:
  | GPayTokenCacheEntry
  | null = null;

export function getCachedGPayToken():
  | GPayAccessToken
  | null {
  if (!tokenCache) {
    return null;
  }

  if (
    Date.now() >=
    tokenCache.refreshAtTimestamp
  ) {
    tokenCache = null;
    return null;
  }

  return tokenCache.token;
}

export function setCachedGPayToken(
  token: GPayAccessToken,
  refreshBufferSeconds: number,
): void {
  const expiresAtTimestamp =
    new Date(token.expiresAt).getTime();

  const refreshAtTimestamp =
    expiresAtTimestamp -
    refreshBufferSeconds * 1000;

  tokenCache = {
    token,
    refreshAtTimestamp:
      Math.max(
        Date.now(),
        refreshAtTimestamp,
      ),
  };
}

export function clearCachedGPayToken(): void {
  tokenCache = null;
}
