<!-- F07A-1B_MARKET_ROUTING_V1 -->

# F07A-1B — Market detection, preference cookie and locale routing

## Status

This slice adds routing infrastructure only. It does not translate UI content, convert prices,
or change checkout/payment behavior.

## Feature flags

- `YSIM_MARKET_ROUTING_ENABLED=true` activates redirects and locale rewrites.
- `YSIM_MARKET_TEST_MODE=true` enables `x-ysim-test-country` only when
  `NODE_ENV` is not `production`.

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
- `/vi/...`, `/lo/...`, and `/en/...` are internally rewritten to the existing unprefixed route.
- Query parameters are preserved.
- `/api`, `/_next`, `/ui-preview`, `/.well-known`, static assets, and public metadata files are
  bypassed.
- Locale-prefixed API/static paths are not rewritten into aliases.

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
- Redirect targets are same-origin relative paths only.
- API/webhook routes are excluded from locale routing.
- Redirect responses are private and non-cacheable.
