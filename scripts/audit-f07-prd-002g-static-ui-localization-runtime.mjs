import assert from "node:assert/strict";

const locales = ["vi", "en", "lo"];
const routes = [
  "/",
  "/destinations",
  "/esim",
  "/offers",
  "/support",
  "/checkout",
];
const baseArgument = process.argv.find((value) =>
  value.startsWith("--base-url="),
);
const baseUrl = new URL(
  baseArgument?.slice("--base-url=".length) ||
    process.env.YSIM_AUDIT_BASE_URL ||
    "http://127.0.0.1:3002",
);
const requestTimeoutMs = Number(process.env.YSIM_AUDIT_TIMEOUT_MS || 20_000);

const staticCopyMatrix = {
  vi: {
    home: ["Kết nối ngay khi bạn đặt chân đến nơi", "Bạn sẽ đi đâu?"],
    destinations: ["Tìm điểm đến cho chuyến đi tiếp theo", "Bạn sẽ đi đâu?"],
    esim: ["Chọn eSIM theo châu lục", "Nhật Bản", "Châu Á"],
    support: ["Sẵn sàng đồng hành", "Email hỗ trợ", "Gửi email"],
    region: ["Chọn eSIM theo khu vực", "Đông Nam Á", "8+ quốc gia"],
    global: ["Một eSIM cho hành trình toàn cầu", "Lọc eSIM Toàn cầu"],
    product: [
      "Lựa chọn mua hàng",
      "Cài đặt eSIM khi có kết nối Wi‑Fi ổn định.",
    ],
  },
  en: {
    home: ["Connect as soon as you arrive", "Where are you going?"],
    destinations: ["Find the next destination", "Where are you going?"],
    esim: ["Choose an eSIM by continent", "Japan", "Asia"],
    support: ["Ready to help", "Email support", "Send email"],
    region: ["Choose an eSIM by region", "Southeast Asia", "8+ countries"],
    global: ["One eSIM for a global journey", "Filter global eSIMs"],
    product: [
      "Purchase selection",
      "Install the eSIM over a stable Wi‑Fi connection.",
    ],
  },
  lo: {
    home: ["ເຊື່ອມຕໍ່ໄດ້ທັນທີເມື່ອຮອດປາຍທາງ", "ທ່ານຈະໄປໃສ?"],
    destinations: ["ຊອກຫາຈຸດໝາຍສຳລັບການເດີນທາງຄັ້ງຕໍ່ໄປ", "ທ່ານຈະໄປໃສ?"],
    esim: ["ເລືອກ eSIM ຕາມທະວີບ", "ຍີ່ປຸ່ນ", "ອາຊີ"],
    support: ["ພ້ອມຊ່ວຍເຫຼືອ", "ອີເມວຊ່ວຍເຫຼືອ", "ສົ່ງອີເມວ"],
    region: ["ເລືອກ eSIM ຕາມພູມິພາກ", "ອາຊີຕາເວັນອອກສ່ຽງໃຕ້", "8+ ປະເທດ"],
    global: ["ໜຶ່ງ eSIM ສຳລັບການເດີນທາງທົ່ວໂລກ", "ກັ່ນຕອງ eSIM ທົ່ວໂລກ"],
    product: [
      "ຕົວເລືອກການຊື້",
      "ຕິດຕັ້ງ eSIM ເມື່ອມີການເຊື່ອມຕໍ່ Wi‑Fi ທີ່ໝັ້ນຄົງ.",
    ],
  },
};

function localizedPath(locale, path) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

async function request(path, redirect = "manual") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(new URL(path, baseUrl), {
      method: "GET",
      redirect,
      signal: controller.signal,
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([A-Za-z:-]+)=(?:"([^"]*)"|'([^']*)')/gu)].map(
      (match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? ""],
    ),
  );
}

function linkTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/giu)].map((match) =>
    attributes(match[0]),
  );
}

function anchorHrefs(html) {
  return [
    ...html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/giu),
  ].map((match) => (match[1] ?? match[2] ?? "").replaceAll("&amp;", "&"));
}

function assertCopy(html, sentinels, scope) {
  for (const sentinel of sentinels) {
    assert.ok(
      html.includes(sentinel),
      `${scope}: missing localized copy: ${sentinel}`,
    );
  }
}

function esimExplorerFragment(html, path) {
  const start = html.indexOf('data-ysim-static-copy-scope="esim-explorer"');
  assert.ok(start >= 0, `${path}: eSIM explorer scope marker missing`);
  const end = html.indexOf("</section>", start);
  assert.ok(end > start, `${path}: eSIM explorer scope boundary missing`);
  return html.slice(start, end + "</section>".length);
}

function comparablePath(href) {
  const value = new URL(href, baseUrl);
  return `${value.pathname}${value.search}`;
}

function assertMetadata(html, locale, path) {
  const expected = localizedPath(locale, path);
  const links = linkTags(html);
  const canonical = links.find((link) => link.rel === "canonical")?.href;
  assert.ok(canonical, `${expected}: canonical missing`);
  assert.equal(new URL(canonical, baseUrl).pathname, expected);

  for (const alternateLocale of [...locales, "x-default"]) {
    const alternate = links.find(
      (link) => link.rel === "alternate" && link.hreflang === alternateLocale,
    )?.href;
    assert.ok(alternate, `${expected}: hreflang ${alternateLocale} missing`);
    const targetLocale =
      alternateLocale === "x-default" ? "vi" : alternateLocale;
    assert.equal(
      new URL(alternate, baseUrl).pathname,
      localizedPath(targetLocale, path),
      `${expected}: hreflang ${alternateLocale} target mismatch`,
    );
  }
}

for (const path of routes) {
  const response = await request(path);
  assert.equal(response.status, 308, `${path}: expected default-locale 308`);
  assert.equal(
    comparablePath(response.headers.get("location") || ""),
    localizedPath("vi", path),
    `${path}: default-locale redirect mismatch`,
  );
}
console.log("DEFAULT_VI_REDIRECTS=PASS_6_OF_6");

const documents = new Map();
for (const locale of locales) {
  for (const path of routes) {
    const publicPath = localizedPath(locale, path);
    const response = await request(publicPath);
    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();
    assert.equal(response.status, 200, `${publicPath}: expected 200`);
    assert.match(contentType, /text\/html|application\/xhtml\+xml/iu);
    assert.ok(
      html.includes('data-ysim-ui="refactor"'),
      `${publicPath}: UI marker missing`,
    );
    assert.ok(
      html.includes(`data-ysim-locale="${locale}"`),
      `${publicPath}: locale marker missing`,
    );
    assert.match(html, new RegExp(`<html[^>]+lang=["']${locale}["']`, "iu"));
    assert.ok(
      !anchorHrefs(html).some((href) => href.startsWith("/ui-preview")),
      `${publicPath}: preview page link leaked`,
    );
    assertMetadata(html, locale, path);
    documents.set(publicPath, html);
  }
}
console.log("LOCALE_HTML_MATRIX=PASS_18_OF_18");
console.log("UI_REFACTOR_MARKERS=PASS_18_OF_18");
console.log("CANONICAL_HREFLANG_MATRIX=PASS_18_OF_18");

for (const locale of locales) {
  const copy = staticCopyMatrix[locale];
  assertCopy(documents.get(`/${locale}`) || "", copy.home, `/${locale}`);
  assertCopy(
    documents.get(`/${locale}/destinations`) || "",
    copy.destinations,
    `/${locale}/destinations`,
  );
  const esimPath = `/${locale}/esim`;
  const esimHtml = documents.get(esimPath) || "";
  assertCopy(esimHtml, copy.esim, esimPath);
  if (locale !== "vi") {
    const fragment = esimExplorerFragment(esimHtml, esimPath);
    for (const leaked of [
      "eSIM Quốc gia",
      "eSIM Khu vực",
      "eSIM Toàn cầu",
      "Châu Á",
      "Nhật Bản",
      "Hàn Quốc",
      "Thái Lan",
      "Việt Nam",
      "Trung Quốc",
      "Ấn Độ",
    ]) {
      assert.ok(
        !fragment.includes(leaked),
        `${esimPath}: Vietnamese UI copy leaked: ${leaked}`,
      );
    }
  }
  assertCopy(
    documents.get(`/${locale}/support`) || "",
    copy.support,
    `/${locale}/support`,
  );
}
console.log("STATIC_UI_LOCALIZATION_CONTENT_MATRIX=PASS_12_OF_12");

for (const locale of locales) {
  const copy = staticCopyMatrix[locale];
  for (const state of [
    { query: "?type=region&region=southeast-asia", sentinels: copy.region },
    { query: "?type=global", sentinels: copy.global },
  ]) {
    const path = `/${locale}/esim${state.query}`;
    const response = await request(path);
    const html = await response.text();
    assert.equal(response.status, 200, `${path}: expected 200`);
    assertCopy(html, state.sentinels, path);
    assert.ok(html.includes(`data-ysim-static-copy-locale="${locale}"`));
  }
}
console.log("ESIM_INTERACTION_STATIC_COPY_MATRIX=PASS_6_OF_6");

const productMatch = anchorHrefs(documents.get("/vi/esim") || "")
  .map((href) => new URL(href, baseUrl).pathname)
  .find((path) => /^\/vi\/esim\/[^/]+$/u.test(path));
assert.ok(productMatch, "No dynamic product link found on /vi/esim");
const productSlug = productMatch.split("/").at(-1);
for (const locale of locales) {
  const path = `/${locale}/esim/${productSlug}`;
  const response = await request(path);
  const html = await response.text();
  assert.equal(response.status, 200, `${path}: expected 200`);
  assert.ok(
    html.includes('data-ysim-ui="refactor"'),
    `${path}: UI marker missing`,
  );
  assert.ok(html.includes(`data-ysim-locale="${locale}"`));
  assertMetadata(html, locale, `/esim/${productSlug}`);
  assertCopy(html, staticCopyMatrix[locale].product, path);
}
console.log("DYNAMIC_PRODUCT_LOCALE_ROUTES=PASS_3_OF_3");
console.log("DYNAMIC_PRODUCT_STATIC_UI_LOCALIZATION=PASS_3_OF_3");
console.log("WOOCOMMERCE_CATALOG_LANGUAGE_NORMALIZATION=DEFERRED_NON_BLOCKING");

const hrefs = new Set();
const publicRoutePattern =
  /^\/(?:vi|en|lo)(?:$|\/(?:cart|checkout(?:\/success|\/gpay\/return)?|destinations(?:\/[^/?#]+)?|device-check|esim(?:\/[^/?#]+)?|guides(?:\/[^/?#]+)?|offers|orders\/[^/?#]+|package-assistant|payment\/return|privacy-policy|refund-policy|reviews|support|terms))$/u;
for (const [documentPath, html] of documents) {
  const documentLocale = documentPath.split("/")[1];
  for (const href of anchorHrefs(html)) {
    if (
      !href ||
      href.startsWith("#") ||
      /^(?:mailto|tel|javascript):/iu.test(href)
    )
      continue;
    const target = new URL(href, new URL(documentPath, baseUrl));
    if (target.origin !== baseUrl.origin) continue;
    if (/^\/(?:api|_next)(?:\/|$)/u.test(target.pathname)) continue;
    if (
      /\.(?:avif|css|gif|ico|jpe?g|js|pdf|png|svg|webp|woff2?)(?:$|\?)/iu.test(
        target.pathname,
      )
    )
      continue;
    assert.ok(
      !target.pathname.startsWith("/ui-preview"),
      `${documentPath}: preview link ${href}`,
    );
    assert.ok(
      target.pathname === `/${documentLocale}` ||
        target.pathname.startsWith(`/${documentLocale}/`),
      `${documentPath}: unlocalized internal link ${href}`,
    );
    assert.match(
      target.pathname,
      publicRoutePattern,
      `${documentPath}: unknown production route ${href}`,
    );
    target.hash = "";
    hrefs.add(`${target.pathname}${target.search}`);
  }
}

const internalLinks = [...hrefs];
assert.ok(internalLinks.length > 0, "No internal links discovered");
console.log(
  `INTERNAL_LINK_LOCALE_AND_ROUTE_GRAPH=PASS_${internalLinks.length}_OF_${internalLinks.length}`,
);

for (const path of [
  "/ui-preview/production-route-plan",
  "/ui-preview/localized-shell",
  "/api/ui-preview/content/guides",
]) {
  const response = await request(path);
  assert.equal(response.status, 404, `${path}: expected production 404`);
}
console.log("UI_PREVIEW_ISOLATION=PASS_3_OF_3");
console.log("ORDER_SUBMISSION=NONE");
console.log("PAYMENT_PROVIDER_CALLS=NONE");
console.log("FULFILLMENT_CREATION=NONE");
console.log("CUSTOMER_EMAIL_DELIVERY=NONE");
console.log("F07_PRD_002G_STATIC_UI_LOCALIZATION_RUNTIME_RESULT=PASS");
