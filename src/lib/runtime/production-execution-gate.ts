export type ProductionExecutionCapability =
  | "payment"
  | "fulfillment"
  | "customer-email"
  | "scheduler"
  | "agency-gateway-topup"
  | "payment-owner";

export type ProductionExecutionEnvironment = Readonly<
  Record<string, string | undefined>
>;

export type ProductionExecutionGateDecision =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly code:
        | "YSIM_PRODUCTION_EXECUTION_DISABLED"
        | "YSIM_WAVE1_PUBLIC_CHECKOUT_DISABLED"
        | "YSIM_WAVE1_PAYMENT_ROUTE_DISABLED";
      readonly capability: ProductionExecutionCapability;
      readonly requiredFlags: readonly string[];
      readonly missingFlags: readonly string[];
    };

interface ProductionExecutionRequest {
  readonly nodeEnvironment: string | undefined;
  readonly pathname: string;
  readonly method: string;
  readonly environment?: ProductionExecutionEnvironment;
}

interface PaymentProviderExecutionRequest {
  readonly nodeEnvironment: string | undefined;
  readonly providerId: string;
  readonly environment?: ProductionExecutionEnvironment;
}

function normalized(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function flagEnabled(
  environment: ProductionExecutionEnvironment,
  flag: string,
): boolean {
  return normalized(environment[flag]) === "true";
}

function productionGateApplies(
  nodeEnvironment: string | undefined,
  environment: ProductionExecutionEnvironment,
): boolean {
  if (normalized(nodeEnvironment) !== "production") {
    return false;
  }

  return normalized(environment.YSIM_RUNTIME_ENVIRONMENT) !== "sandbox";
}

function providerFlagsFromPath(pathname: string): readonly string[] {
  if (
    pathname === "/api/payments/gpay" ||
    pathname.startsWith("/api/payments/gpay/")
  ) {
    return ["GPAY_ENABLED"];
  }

  if (
    pathname === "/api/payments/onepay" ||
    pathname.startsWith("/api/payments/onepay/")
  ) {
    return ["ONEPAY_ENABLED"];
  }

  if (
    pathname === "/api/payments/umoney" ||
    pathname.startsWith("/api/payments/umoney/")
  ) {
    return ["UMONEY_ENABLED"];
  }

  if (
    pathname === "/api/fulfillment/gigago" ||
    pathname.startsWith("/api/fulfillment/gigago/")
  ) {
    return ["GIGAGO_ENABLED"];
  }

  return [];
}

function paymentProviderFlags(providerId: string): readonly string[] {
  const normalizedProvider = normalized(providerId);

  if (
    normalizedProvider === "gpay_virtual_account" ||
    normalizedProvider.startsWith("gpay_gateway_")
  ) {
    return ["GPAY_ENABLED"];
  }

  if (
    normalizedProvider === "onepay" ||
    normalizedProvider.startsWith("onepay_")
  ) {
    return ["ONEPAY_ENABLED"];
  }

  if (
    normalizedProvider === "umoney" ||
    normalizedProvider.startsWith("umoney_")
  ) {
    return ["UMONEY_ENABLED"];
  }

  return [];
}

function requestPolicy(
  pathname: string,
  method: string,
): {
  readonly capability: ProductionExecutionCapability;
  readonly requiredFlags: readonly string[];
} | null {
  const normalizedMethod = method.trim().toUpperCase();

  if (pathname === "/api/checkout" && normalizedMethod === "POST") {
    return {
      capability: "payment",
      requiredFlags: ["PAYMENT_EXECUTION_ENABLED"],
    };
  }

  if (pathname === "/api/payments" || pathname.startsWith("/api/payments/")) {
    return {
      capability: "payment",
      requiredFlags: [
        "PAYMENT_EXECUTION_ENABLED",
        ...providerFlagsFromPath(pathname),
      ],
    };
  }

  if (
    pathname === "/api/fulfillment" ||
    pathname.startsWith("/api/fulfillment/")
  ) {
    const extraFlags = [...providerFlagsFromPath(pathname)];

    if (pathname.includes("action-required-alert")) {
      extraFlags.push("CUSTOMER_EMAIL_DELIVERY_ENABLED");
    }

    if (pathname.includes("auto-payment")) {
      extraFlags.push("PAYMENT_EXECUTION_ENABLED", "GPAY_ENABLED");
    }

    return {
      capability: "fulfillment",
      requiredFlags: ["FULFILLMENT_EXECUTION_ENABLED", ...extraFlags],
    };
  }

  if (
    pathname === "/api/email" ||
    pathname.startsWith("/api/email/") ||
    pathname === "/api/customer-email" ||
    pathname.startsWith("/api/customer-email/")
  ) {
    return {
      capability: "customer-email",
      requiredFlags: ["CUSTOMER_EMAIL_DELIVERY_ENABLED"],
    };
  }

  if (
    pathname === "/api/cron" ||
    pathname.startsWith("/api/cron/") ||
    pathname === "/api/scheduler" ||
    pathname.startsWith("/api/scheduler/")
  ) {
    return {
      capability: "scheduler",
      requiredFlags: ["SCHEDULER_ENABLED"],
    };
  }

  if (
    pathname === "/api/agency/topup" ||
    pathname.startsWith("/api/agency/topup/")
  ) {
    return {
      capability: "agency-gateway-topup",
      requiredFlags: ["AGENCY_GATEWAY_TOPUP_ENABLED"],
    };
  }

  if (
    pathname === "/api/payment-owner" ||
    pathname.startsWith("/api/payment-owner/")
  ) {
    return {
      capability: "payment-owner",
      requiredFlags: ["YSIM_PAYMENT_OWNER_ENABLED"],
    };
  }

  return null;
}

function decide(
  capability: ProductionExecutionCapability,
  requiredFlags: readonly string[],
  environment: ProductionExecutionEnvironment,
): ProductionExecutionGateDecision {
  const uniqueFlags = [...new Set(requiredFlags)];
  const missingFlags = uniqueFlags.filter(
    (flag) => !flagEnabled(environment, flag),
  );

  if (missingFlags.length === 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    code: "YSIM_PRODUCTION_EXECUTION_DISABLED",
    capability,
    requiredFlags: uniqueFlags,
    missingFlags,
  };
}

export function decideProductionExecutionGate(
  request: ProductionExecutionRequest,
): ProductionExecutionGateDecision {
  const environment = request.environment ?? process.env;

  if (!productionGateApplies(request.nodeEnvironment, environment)) {
    return { allowed: true };
  }

  const normalizedMethod = request.method.trim().toUpperCase();
  const wave1CanaryArmed =
    normalized(environment.YSIM_WAVE1_GPAY_VA_CANARY_MODE) === "armed";

  if (
    request.pathname === "/api/checkout" &&
    normalizedMethod === "POST" &&
    wave1CanaryArmed
  ) {
    return {
      allowed: false,
      code: "YSIM_WAVE1_PUBLIC_CHECKOUT_DISABLED",
      capability: "payment",
      requiredFlags: [],
      missingFlags: [],
    };
  }

  if (wave1CanaryArmed && request.pathname.startsWith("/api/payments/")) {
    const allowedWave1Route =
      (request.pathname === "/api/payments/create" &&
        normalizedMethod === "POST") ||
      (request.pathname === "/api/payments/gpay/virtual-account/webhook" &&
        (normalizedMethod === "POST" || normalizedMethod === "GET")) ||
      (request.pathname === "/api/payments/gpay/virtual-account/status" &&
        normalizedMethod === "GET");

    if (!allowedWave1Route) {
      return {
        allowed: false,
        code: "YSIM_WAVE1_PAYMENT_ROUTE_DISABLED",
        capability: "payment",
        requiredFlags: [],
        missingFlags: [],
      };
    }
  }

  const policy = requestPolicy(request.pathname, request.method);

  if (!policy) {
    return { allowed: true };
  }

  return decide(policy.capability, policy.requiredFlags, environment);
}

export function decidePaymentProviderExecutionGate(
  request: PaymentProviderExecutionRequest,
): ProductionExecutionGateDecision {
  const environment = request.environment ?? process.env;

  if (!productionGateApplies(request.nodeEnvironment, environment)) {
    return { allowed: true };
  }

  return decide(
    "payment",
    ["PAYMENT_EXECUTION_ENABLED", ...paymentProviderFlags(request.providerId)],
    environment,
  );
}
