import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  getPaymentMethodForLocale,
  getPaymentMethodsForLocale,
  isPaymentLocale,
  isPaymentProviderAllowedForLocale,
  PAYMENT_LOCALE_POLICY_VERSION,
} from "../src/features/payments/payment-locale-policy.ts";

const root = resolve(import.meta.dirname, "..");
let passed = 0;

function pass(name) {
  passed += 1;
  console.log(`${name}=PASS`);
}

assert.equal(PAYMENT_LOCALE_POLICY_VERSION, "f08-01-v1");
assert.equal(isPaymentLocale("vi"), true);
assert.equal(isPaymentLocale("en"), true);
assert.equal(isPaymentLocale("lo"), true);
assert.equal(isPaymentLocale("fr"), false);
assert.equal(isPaymentLocale(null), false);
pass("SUPPORTED_LOCALES_ARE_EXACT");

assert.deepEqual(getPaymentMethodsForLocale("vi"), [
  {
    id: "gpay_virtual_account",
    title: "QRcode chuyển khoản",
    description:
      "Quét mã QR để chuyển khoản qua tài khoản ảo GPay dành riêng cho đơn hàng.",
  },
]);
assert.equal(
  isPaymentProviderAllowedForLocale("vi", "gpay_virtual_account"),
  true,
);
assert.equal(
  isPaymentProviderAllowedForLocale("vi", "gpay_gateway_all"),
  false,
);
pass("VI_ONLY_ALLOWS_GPAY_VIRTUAL_ACCOUNT");

for (const locale of ["en", "lo"]) {
  const methods = getPaymentMethodsForLocale(locale);
  assert.equal(methods.length, 1);
  assert.equal(methods[0]?.id, "gpay_gateway_all");
  assert.equal(methods[0]?.title, "Payment Gateway");
  assert.equal(
    isPaymentProviderAllowedForLocale(locale, "gpay_virtual_account"),
    false,
  );
  assert.equal(
    isPaymentProviderAllowedForLocale(locale, "gpay_gateway_all"),
    true,
  );
}
pass("EN_AND_LO_ONLY_ALLOW_GPAY_GATEWAY");

for (const locale of ["vi", "en", "lo"]) {
  assert.equal(
    isPaymentProviderAllowedForLocale(locale, "gpay_gateway_card"),
    false,
  );
  assert.equal(
    isPaymentProviderAllowedForLocale(locale, "gpay_gateway_atm"),
    false,
  );
  assert.equal(
    isPaymentProviderAllowedForLocale(locale, "gpay_gateway_qr"),
    false,
  );
  assert.equal(isPaymentProviderAllowedForLocale(locale, "cash_agent"), false);
}
pass("NON_MATRIX_PROVIDER_IDS_FAIL_CLOSED");

assert.equal(
  getPaymentMethodForLocale("vi", "gpay_gateway_all"),
  null,
);
assert.equal(
  getPaymentMethodForLocale("en", "gpay_virtual_account"),
  null,
);
pass("DISALLOWED_PROVIDER_HAS_NO_PRESENTATION");

const checkoutRoute = readFileSync(
  resolve(root, "src/app/api/checkout/route.ts"),
  "utf8",
);
assert.match(checkoutRoute, /getPaymentMethodsForLocale\(locale\)/);
assert.match(checkoutRoute, /isPaymentProviderAllowedForLocale/);
assert.match(checkoutRoute, /PAYMENT_PROVIDER_NOT_ALLOWED_FOR_LOCALE/);
pass("CHECKOUT_API_ENFORCES_POLICY");

const paymentRoute = readFileSync(
  resolve(root, "src/app/api/payments/create/route.ts"),
  "utf8",
);
assert.match(paymentRoute, /isPaymentProviderAllowedForLocale/);
assert.match(paymentRoute, /PAYMENT_PROVIDER_NOT_ALLOWED_FOR_LOCALE/);
assert.match(paymentRoute, /ORDER_PAYMENT_PROVIDER_MISMATCH/);
assert.match(paymentRoute, /order\.payment_method !== values\.provider/);
assert.match(paymentRoute, /PAYMENT_LOCALE_ORDER_MISMATCH/);
assert.match(paymentRoute, /_ysim_checkout_locale/);
pass("PAYMENT_CREATE_API_ENFORCES_AND_BINDS_POLICY");

const checkoutClient = readFileSync(
  resolve(root, "src/components/checkout/CheckoutContent.tsx"),
  "utf8",
);
assert.match(checkoutClient, /api\/checkout\?locale=/);
const checkoutForm = readFileSync(
  resolve(root, "src/components/checkout/CheckoutForm.tsx"),
  "utf8",
);
assert.match(checkoutForm, /type="hidden" .*register\("locale"\)/);
assert.match(checkoutForm, /locale: selectedLocale/);
const paymentCandidateClient = readFileSync(
  resolve(
    root,
    "src/features/payments/candidate/payment-candidate-client.ts",
  ),
  "utf8",
);
assert.match(paymentCandidateClient, /locale: ShellLocale/);
assert.match(paymentCandidateClient, /locale,/);
pass("CHECKOUT_CLIENTS_PROPAGATE_LOCALE_TO_PAYMENT_APIS");

const checkoutCandidateApiClient = readFileSync(
  resolve(
    root,
    "src/features/checkout/refactor/checkout-candidate-client.ts",
  ),
  "utf8",
);
assert.match(checkoutCandidateApiClient, /locale:\s*ShellLocale/);
assert.match(
  checkoutCandidateApiClient,
  /api\/checkout\?locale=\$\{encodeURIComponent\(locale\)\}/,
);
const checkoutCandidateIntegration = readFileSync(
  resolve(
    root,
    "src/components/checkout/refactor/integration/CheckoutCandidateClient.tsx",
  ),
  "utf8",
);
assert.match(
  checkoutCandidateIntegration,
  /await loadCheckoutCandidate\(\s*locale,\s*\)/,
);
pass("CHECKOUT_CANDIDATE_LOAD_PROPAGATES_LOCALE");

const paymentReturnPage = readFileSync(
  resolve(root, "src/app/payment/return/page.tsx"),
  "utf8",
);
assert.match(paymentReturnPage, /<PaymentCandidateClient[\s\S]*resultOnly/);
pass("PAYMENT_RETURN_IS_RESULT_ONLY");

console.log(`F08_GPAY_LOCALE_ROUTING_TESTS_PASSED=${passed}`);
