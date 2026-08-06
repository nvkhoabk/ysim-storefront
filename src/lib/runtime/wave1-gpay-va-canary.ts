export const WAVE1_GPAY_VA_CANARY_PROVIDER = "gpay_virtual_account" as const;
export const WAVE1_GPAY_VA_CANARY_HARD_MAX_VND = 200_000;

export type Wave1CanaryEnvironment = Readonly<
  Record<string, string | undefined>
>;

export interface Wave1GPayVACanaryPolicy {
  readonly active: true;
  readonly provider: typeof WAVE1_GPAY_VA_CANARY_PROVIDER;
  readonly orderId: number;
  readonly amountVnd: number;
  readonly hardMaxAmountVnd: typeof WAVE1_GPAY_VA_CANARY_HARD_MAX_VND;
  readonly budgetFile: string;
}

export class Wave1GPayVACanaryError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 409) {
    super(message);
    this.name = "Wave1GPayVACanaryError";
    this.code = code;
    this.status = status;
  }
}

function normalized(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function enabled(environment: Wave1CanaryEnvironment, name: string): boolean {
  return normalized(environment[name]) === "true";
}

function positiveInteger(value: string | undefined, name: string): number {
  const raw = value?.trim() ?? "";

  if (!/^\d+$/u.test(raw)) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_CONFIGURATION_INVALID",
      `${name} phải là số nguyên dương.`,
      503,
    );
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_CONFIGURATION_INVALID",
      `${name} phải là số nguyên dương an toàn.`,
      503,
    );
  }

  return parsed;
}

function productionGateApplies(
  nodeEnvironment: string | undefined,
  environment: Wave1CanaryEnvironment,
): boolean {
  return (
    normalized(nodeEnvironment) === "production" &&
    normalized(environment.YSIM_RUNTIME_ENVIRONMENT) !== "sandbox"
  );
}

export function readWave1GPayVACanaryPolicy({
  nodeEnvironment,
  environment = process.env,
}: {
  readonly nodeEnvironment: string | undefined;
  readonly environment?: Wave1CanaryEnvironment;
}): Wave1GPayVACanaryPolicy | null {
  if (!productionGateApplies(nodeEnvironment, environment)) {
    return null;
  }

  const activationFlags = [
    "PAYMENT_EXECUTION_ENABLED",
    "GPAY_ENABLED",
    "GPAY_VA_ENABLED",
  ] as const;
  const enabledFlags = activationFlags.filter((name) =>
    enabled(environment, name),
  );

  if (enabledFlags.length === 0) {
    return null;
  }

  if (enabledFlags.length !== activationFlags.length) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_ACTIVATION_FLAG_DRIFT",
      "Wave 1 yêu cầu bật đồng thời đúng ba cờ payment/GPay/GPay VA.",
      503,
    );
  }

  const deferredFlags = [
    "FULFILLMENT_EXECUTION_ENABLED",
    "CUSTOMER_EMAIL_DELIVERY_ENABLED",
    "SCHEDULER_ENABLED",
    "AGENCY_GATEWAY_TOPUP_ENABLED",
    "YSIM_PAYMENT_OWNER_ENABLED",
    "ONEPAY_ENABLED",
    "UMONEY_ENABLED",
    "GIGAGO_ENABLED",
    "GPAY_FAST_ACK_ENABLED",
    "GPAY_DELAYED_RECONCILIATION_ENABLED",
    "CASH_PAYMENT_ENABLED",
  ] as const;
  const nonFalseDeferredFlags = deferredFlags.filter(
    (name) => normalized(environment[name]) !== "false",
  );

  if (nonFalseDeferredFlags.length > 0) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_DEFERRED_FLAG_DRIFT",
      "Wave 1 yêu cầu toàn bộ 11 execution flag deferred giữ nguyên false.",
      503,
    );
  }

  if (
    normalized(environment.GPAY_COMMERCE_AUTOMATION_MODE) !== "record" ||
    normalized(environment.GPAY_CALLBACK_RECONCILIATION_MODE) !== "query" ||
    normalized(environment.GPAY_COMMERCE_AUTOMATION_REQUIRE_QUERY) !== "true"
  ) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_RECORD_QUERY_CONTRACT_DRIFT",
      "Wave 1 yêu cầu record mode và query reconciliation bắt buộc.",
      503,
    );
  }

  if (normalized(environment.YSIM_MARKET_ROUTING_ENABLED) !== "false") {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_MARKET_ROUTING_DRIFT",
      "Wave 1 yêu cầu market routing giữ nguyên false.",
      503,
    );
  }

  if (normalized(environment.YSIM_WAVE1_GPAY_VA_CANARY_MODE) !== "armed") {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_NOT_ARMED",
      "Wave 1 production chỉ được chạy khi canary budget đã được arm.",
      503,
    );
  }

  const orderId = positiveInteger(
    environment.YSIM_WAVE1_GPAY_VA_CANARY_ORDER_ID,
    "YSIM_WAVE1_GPAY_VA_CANARY_ORDER_ID",
  );
  const amountVnd = positiveInteger(
    environment.YSIM_WAVE1_GPAY_VA_CANARY_AMOUNT_VND,
    "YSIM_WAVE1_GPAY_VA_CANARY_AMOUNT_VND",
  );

  if (amountVnd > WAVE1_GPAY_VA_CANARY_HARD_MAX_VND) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_AMOUNT_EXCEEDS_HARD_MAX",
      `Canary vượt trần ${WAVE1_GPAY_VA_CANARY_HARD_MAX_VND} VND.`,
      503,
    );
  }

  const budgetFile =
    environment.YSIM_WAVE1_GPAY_VA_CANARY_BUDGET_FILE?.trim() ?? "";

  const expectedBudgetFile =
    `/var/www/ysim.vn/storefront/shared/state/` +
    `f07-wave1-gpay-va-canary-${orderId}.json`;

  if (budgetFile !== expectedBudgetFile) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_BUDGET_PATH_INVALID",
      "Canary budget file nằm ngoài production shared state root.",
      503,
    );
  }

  return {
    active: true,
    provider: WAVE1_GPAY_VA_CANARY_PROVIDER,
    orderId,
    amountVnd,
    hardMaxAmountVnd: WAVE1_GPAY_VA_CANARY_HARD_MAX_VND,
    budgetFile,
  };
}

export function assertWave1GPayVACanaryRequest({
  provider,
  orderId,
  amountVnd,
  nodeEnvironment,
  environment = process.env,
}: {
  readonly provider: string;
  readonly orderId: number;
  readonly amountVnd: number;
  readonly nodeEnvironment: string | undefined;
  readonly environment?: Wave1CanaryEnvironment;
}): Wave1GPayVACanaryPolicy | null {
  const policy = readWave1GPayVACanaryPolicy({
    nodeEnvironment,
    environment,
  });

  if (!policy) {
    return null;
  }

  if (provider !== policy.provider) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_PROVIDER_REJECTED",
      "Wave 1 chỉ cho phép gpay_virtual_account.",
    );
  }

  if (orderId !== policy.orderId) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_ORDER_REJECTED",
      "Order không khớp order ID canary đã phê duyệt.",
    );
  }

  if (
    !Number.isSafeInteger(amountVnd) ||
    amountVnd !== policy.amountVnd ||
    amountVnd > policy.hardMaxAmountVnd
  ) {
    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_AMOUNT_REJECTED",
      "Số tiền không khớp canary đã phê duyệt hoặc vượt hard cap.",
    );
  }

  return policy;
}
