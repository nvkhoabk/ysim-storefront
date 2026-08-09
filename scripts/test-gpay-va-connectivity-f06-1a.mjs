#!/usr/bin/env node

const args = process.argv.slice(2);
const value = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);

  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};

const baseUrl = value("base-url", "https://sandbox.ysim.vn").replace(
  /\/+$/,
  "",
);
const secret = process.env.GPAY_SANDBOX_TEST_SECRET?.trim();

if (!secret) {
  throw new Error("Thiếu GPAY_SANDBOX_TEST_SECRET.");
}

const response = await fetch(
  `${baseUrl}/api/payments/gpay/virtual-account/test-connectivity`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "x-ysim-sandbox-secret": secret,
    },
  },
);
const body = await response.json();

console.log(`HTTP=${response.status}`);
console.log(JSON.stringify(body, null, 2));

if (
  !response.ok ||
  body.success !== true ||
  body.result?.tokenPresent !== true
) {
  throw new Error("F06.1A GPay VA connectivity test failed.");
}

console.log("PASS: F06.1A GPay VA token connectivity.");
