#!/usr/bin/env node

const baseUrl = (
  process.env.GIGAGO_BASE_URL || "https://sandbox-partners-api.gigago.com"
).replace(/\/+$/, "");
const apiKey = process.env.GIGAGO_API_KEY?.trim();
const timeoutMs = Number.parseInt(process.env.GIGAGO_TIMEOUT_MS || "15000", 10);
const planId =
  process.argv.find((value) => value.startsWith("--plan-id="))?.split("=")[1] ||
  "GIGA-DEMO";

if (!apiKey) {
  console.error("FAIL: missing GIGAGO_API_KEY.");
  process.exit(1);
}

async function call(pathname, init) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      apiKey,
      ...init.headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Non-JSON response from ${pathname}: ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${pathname}`);
  }

  if (
    !body ||
    body.code !== 200 ||
    /^failed!?$/i.test(String(body.message || "").trim())
  ) {
    throw new Error(
      `Gigago rejected ${pathname}: ${String(body?.message || "unknown")}`,
    );
  }

  return body;
}

try {
  const [balanceEnvelope, packagesEnvelope] = await Promise.all([
    call("/api/partner/getBalance", { method: "GET" }),
    call("/api/partner/getPackages", {
      method: "POST",
      body: JSON.stringify({
        columnFilters: {},
        sort: [],
        page: 0,
        pageSize: 0,
        language_code: "vi",
      }),
    }),
  ]);

  const packages = Array.isArray(packagesEnvelope.result)
    ? packagesEnvelope.result
    : [];
  const matchedPlan =
    packages.find((item) => item.ggg_plan_id === planId) || null;

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Balance: ${balanceEnvelope.result}`);
  console.log(`Packages: ${packages.length}`);
  console.log(
    `Plan ${planId}: ${
      matchedPlan
        ? `FOUND · ${matchedPlan.name} · ${matchedPlan.price}`
        : "NOT FOUND"
    }`,
  );

  if (!matchedPlan) {
    console.error("FAIL: sandbox test plan was not found.");
    process.exit(2);
  }

  console.log("PASS: Gigago sandbox connectivity is ready.");
} catch (error) {
  console.error(
    `FAIL: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
