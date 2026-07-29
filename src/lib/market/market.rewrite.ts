// F07A-1B_MARKET_ROUTING_R4

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function assertRelativeApplicationPath(destination: string): void {
  if (
    !destination.startsWith("/") ||
    destination.startsWith("//") ||
    destination.startsWith("/\\")
  ) {
    throw new Error("MARKET_REWRITE_DESTINATION_MUST_BE_RELATIVE");
  }
}

/**
 * Build a same-origin URL for a Next.js internal rewrite.
 *
 * Nginx terminates public HTTPS and forwards to the local Next.js listener
 * over HTTP. Next.js can combine X-Forwarded-Proto=https with its local
 * listener address and expose request.url as https://localhost:3001/....
 * Reusing that URL unchanged makes the internal proxy attempt TLS against an
 * HTTP-only listener and fail with EPROTO. Only that loopback/non-standard-
 * port transport is normalized back to HTTP; external HTTPS origins remain
 * HTTPS.
 */
export function buildInternalMarketRewriteUrl(
  requestUrl: string,
  destination: string,
): URL {
  assertRelativeApplicationPath(destination);

  const source = new URL(requestUrl);
  if (!new Set(["http:", "https:"]).has(source.protocol)) {
    throw new Error("MARKET_REWRITE_REQUEST_PROTOCOL_UNSUPPORTED");
  }

  const target = new URL(destination, source);
  if (target.origin !== source.origin) {
    throw new Error("MARKET_REWRITE_DESTINATION_ORIGIN_MISMATCH");
  }

  const hostname = target.hostname.toLowerCase();
  if (
    target.protocol === "https:" &&
    LOOPBACK_HOSTNAMES.has(hostname) &&
    target.port !== "" &&
    target.port !== "443"
  ) {
    target.protocol = "http:";
  }

  return target;
}
