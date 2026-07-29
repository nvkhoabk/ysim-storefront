<!-- F07A-1B_MARKET_ROUTING_R4 -->

# F07A-1B — Market detection, preference cookie and locale routing

## Status

This slice adds routing infrastructure only. It does not translate UI content, convert prices,
or change checkout/payment behavior.

R3 prevents a localized rewrite from being resolved a second time by cookie/IP. R4 fixes the
public reverse-proxy transport defect found during sandbox acceptance. When Nginx terminates
HTTPS and forwards to Next.js over HTTP, Next.js can expose the incoming URL as
`https://localhost:3001/...`. Reusing that origin for an internal rewrite makes the Next.js
proxy attempt TLS against its HTTP-only loopback listener and fail with `EPROTO`.

R4 builds internal rewrite URLs through `buildInternalMarketRewriteUrl()`. Relative paths remain
same-origin, but an HTTPS loopback URL on a non-443 port is normalized to HTTP. External HTTPS
origins are never downgraded.

## Feature flags

- `YSIM_MARKET_ROUTING_ENABLED=true` activates redirects and locale rewrites.
- `YSIM_MARKET_TEST_MODE=true` enables `x-ysim-test-country` only when `NODE_ENV` is not
  `production`.

The default is disabled, so deployment is a no-op until the feature flag is explicitly enabled.

## Resolution precedence

1. Locale already present in the URL.
2. Explicit `ysim_market` cookie.
3. Cloudflare `CF-IPCountry` country code.
4. Configured global fallback for recognized foreign country codes.
5. Configured Vietnamese default for missing, `XX`, `T1`, or invalid country codes.

The proxy never writes the cookie. The cookie is written only by an explicit request to
`POST /api/preferences/market`.

## Route behavior

- `/` redirects to `/vi`, `/lo`, or `/en` according to the resolver.
- `/vi/...`, `/lo/...`, and `/en/...` are internally rewritten once to the existing unprefixed
  route.
- The internal rewrite marker is removed before the route handler receives the request.
- Query parameters are preserved.
- `/api`, `/_next`, `/ui-preview`, `/.well-known`, static assets, and public metadata files are
  bypassed.
- Locale-prefixed API/static paths are not rewritten into aliases.

## Reverse-proxy transport invariant

Public HTTPS remains HTTPS for the browser, redirects, cookie security and canonical URLs.
Only the internal loopback transport is normalized:

```text
request.url:          https://localhost:3001/en/esim
localized target:     /esim
internal rewrite:     http://localhost:3001/esim
browser URL remains:  https://sandbox.ysim.vn/en/esim
```

The rewrite helper accepts only same-origin relative application paths and rejects absolute,
protocol-relative and backslash-based external destinations.

Nginx must continue to forward the public protocol accurately:

```nginx
proxy_pass http://127.0.0.1:3001;
proxy_set_header X-Forwarded-Proto https;
```

Do not change `X-Forwarded-Proto` to `http`; that would hide the transport bug and weaken Secure
cookie detection.

## Runtime acceptance

Run the full sandbox probe after enabling routing:

```bash
node scripts/probe-f07a-1b-market-routing-runtime.mjs \
  --origin-base-url=http://127.0.0.1:3001 \
  --forwarded-host=sandbox.ysim.vn \
  --local-nginx-ip=127.0.0.1 \
  --public-base-url=https://sandbox.ysim.vn
```

The probe validates:

1. Direct Node origin country routing.
2. Direct localized routes.
3. Node origin with public Host and `X-Forwarded-Proto=https`.
4. Local Nginx HTTPS while bypassing Cloudflare.
5. Public Cloudflare HTTPS.
6. Origin and public GPay webhook bypass.

The forwarded-host response must contain an HTTP loopback rewrite and must never contain
`https://localhost:3001`.

## Cloudflare country acceptance

Cloudflare supplies `CF-IPCountry` from the actual visitor connection. Sending a forged
`CF-IPCountry` header through the public proxied hostname is not a valid country simulation and
may be replaced by Cloudflare. Use the direct origin probe for deterministic VN/LA/US acceptance,
or use real client/VPN locations for public-edge validation.

## Preference API

`POST /api/preferences/market`

```json
{
  "marketId": "lo-la",
  "returnPath": "/vi/esim?days=7"
}
```

The response contains a safe localized `redirectPath` and sets `ysim_market` for one year.
External or protocol-relative return paths fall back to the selected locale root.

`DELETE /api/preferences/market` clears the explicit preference cookie.

## Security and privacy

- No external IP geolocation provider is called.
- The client IP address is not stored.
- `x-ysim-test-country` is ignored in production.
- Redirect and rewrite targets remain same-origin.
- External HTTPS origins are not downgraded.
- API/webhook routes are excluded from locale routing.
- Redirect responses are private and non-cacheable.
