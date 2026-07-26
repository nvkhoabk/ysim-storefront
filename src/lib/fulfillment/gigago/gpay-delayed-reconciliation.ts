import { randomUUID } from "node:crypto";

import {
  normalizeGPayGatewayStatus,
  type GPayGatewayCallbackVerification,
  type GPayGatewayNormalizedStatus,
} from "@/lib/payment/adapters/gpay/gateway-callback";
import { queryGPayGatewayOrder } from "@/lib/payment/adapters/gpay/gateway-query-order";
import type { GPayGatewayQueryOrderResult } from "@/lib/payment/adapters/gpay/gateway-types";
import type { GPayCallbackReconciliationResult } from "@/lib/payment/adapters/gpay/gateway-reconciliation";
import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";

import {
  assertGPayCommerceOrderIdentity,
  getGPayCommerceAutomationMode,
  parseGPayCommerceEmbedData,
  runGPayCommerceAutomation,
  type GPayCommerceAutomationMode,
  type GPayCommerceAutomationResult,
  type GPayWooPaymentDiagnostic,
} from "./gpay-commerce-automation";
import type { GigagoDeliveryAssessment } from "./gigago-delivery-assessment";
import type { GigagoFulfillmentMode } from "./gigago-fulfillment-service";

export type GPayDelayedReconciliationState =
  | "pending"
  | "processing"
  | "provider-confirmed"
  | "pending-commerce"
  | "pending-fulfillment"
  | "action-required"
  | "succeeded"
  | "failed"
  | "mismatch"
  | "exhausted";

interface StoredVerification {
  verified: true;
  verificationStrategy: string;
  normalizedStatus: "SUCCESS";
  callback: GPayGatewayCallbackVerification["callback"];
  parsedEmbedData: unknown;
  canonicalSha256: string;
  contractVersion: string;
}

interface ConfirmedQuerySnapshot {
  gpayTransactionId: string;
  status: string;
  userPaymentMethod: string;
  queriedAt: string;
}

interface GPayDelayedReconciliationJob {
  version: "f04.2" | "f04.2.1" | "f04.3.2";
  orderId: number;
  state: GPayDelayedReconciliationState;
  attempts: number;
  maxAttempts: number;
  retryDelaysSeconds: number[];
  commerceAttempts: number;
  maxCommerceAttempts: number;
  commerceRetryDelaysSeconds: number[];
  fulfillmentPollAttempts: number;
  maxFulfillmentPollAttempts: number;
  fulfillmentPollDelaysSeconds: number[];
  providerConfirmedAt: string | null;
  confirmedQuery: ConfirmedQuerySnapshot | null;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
  automationMode: Exclude<GPayCommerceAutomationMode, "disabled">;
  fulfillmentMode: GigagoFulfillmentMode;
  verification: StoredVerification;
  lastQueriedStatus: GPayGatewayNormalizedStatus | null;
  lastError: string | null;
  lockToken: string | null;
  lockExpiresAt: string | null;
  result: {
    reason: string;
    paymentRecorded: boolean;
    commerceStateChanged: boolean;
    fulfillmentAttempted: boolean;
    fulfillmentSucceeded: boolean | null;
    fulfillmentState?: "not-started" | "processing" | "succeeded" | "failed";
    fulfillmentAssessment?: GigagoDeliveryAssessment;
    paymentDiagnostic?: GPayWooPaymentDiagnostic;
  } | null;
}

interface GPayDelayedQueryOverride {
  merchantOrderId: string;
  gpayBillId: string;
  gpayTransactionId?: string;
  status?: string;
  embedData?: string;
  userPaymentMethod?: string;
  queriedAt: string;
}

export interface GPayDelayedReconciliationView {
  orderId: number;
  state: GPayDelayedReconciliationState;
  attempts: number;
  maxAttempts: number;
  providerAttempts: number;
  commerceAttempts: number;
  maxCommerceAttempts: number;
  fulfillmentPollAttempts: number;
  maxFulfillmentPollAttempts: number;
  providerConfirmed: boolean;
  providerConfirmedAt: string | null;
  nextAttemptAt: string | null;
  automationMode: Exclude<GPayCommerceAutomationMode, "disabled">;
  fulfillmentMode: GigagoFulfillmentMode;
  lastQueriedStatus: GPayGatewayNormalizedStatus | null;
  lastError: string | null;
  result: GPayDelayedReconciliationJob["result"];
}

export interface EnqueueGPayDelayedReconciliationResult extends GPayDelayedReconciliationView {
  duplicate: boolean;
  scheduleRecommended: boolean;
}

export interface ProcessGPayDelayedReconciliationOptions {
  force?: boolean;
  syntheticStatus?: "PENDING" | "SUCCESS" | "FAILED";
}

const META = {
  job: "_ysim_gpay_reconciliation_job",
  state: "_ysim_gpay_reconciliation_state",
  attempts: "_ysim_gpay_reconciliation_attempts",
  nextAt: "_ysim_gpay_reconciliation_next_at",
  updatedAt: "_ysim_gpay_reconciliation_updated_at",
  lastStatus: "_ysim_gpay_reconciliation_last_status",
  lastError: "_ysim_gpay_reconciliation_last_error",
} as const;

const DEFAULT_RETRY_DELAYS_SECONDS = [5, 15, 30, 60];
const DEFAULT_COMMERCE_RETRY_DELAYS_SECONDS = [1, 3, 10];
const DEFAULT_FULFILLMENT_POLL_DELAYS_SECONDS = [15, 30, 60, 120, 300, 300];
const processing = new Map<number, Promise<GPayDelayedReconciliationView>>();

function nowIso(): string {
  return new Date().toISOString();
}

function parsePositiveSeconds(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10);

  return Number.isInteger(parsed) && parsed > 0 && parsed <= 3600
    ? parsed
    : null;
}

export function getGPayReconciliationRetryDelaysSeconds(): number[] {
  const configured =
    process.env.GPAY_RECONCILIATION_RETRY_DELAYS_SECONDS?.trim();

  if (!configured) {
    return [...DEFAULT_RETRY_DELAYS_SECONDS];
  }

  const parsed = configured
    .split(",")
    .map(parsePositiveSeconds)
    .filter((value): value is number => value !== null);

  return parsed.length > 0 ? parsed : [...DEFAULT_RETRY_DELAYS_SECONDS];
}

export function getGPayCommerceRetryDelaysSeconds(): number[] {
  const configured = process.env.GPAY_COMMERCE_RETRY_DELAYS_SECONDS?.trim();

  if (!configured) {
    return [...DEFAULT_COMMERCE_RETRY_DELAYS_SECONDS];
  }

  const parsed = configured
    .split(",")
    .map(parsePositiveSeconds)
    .filter((value): value is number => value !== null);

  return parsed.length > 0
    ? parsed
    : [...DEFAULT_COMMERCE_RETRY_DELAYS_SECONDS];
}

export function getGPayFulfillmentPollDelaysSeconds(): number[] {
  const configured = process.env.GPAY_FULFILLMENT_POLL_DELAYS_SECONDS?.trim();

  if (!configured) {
    return [...DEFAULT_FULFILLMENT_POLL_DELAYS_SECONDS];
  }

  const parsed = configured
    .split(",")
    .map(parsePositiveSeconds)
    .filter((value): value is number => value !== null);

  return parsed.length > 0
    ? parsed
    : [...DEFAULT_FULFILLMENT_POLL_DELAYS_SECONDS];
}

export function isGPayDelayedReconciliationEnabled(): boolean {
  return (
    process.env.GPAY_DELAYED_RECONCILIATION_ENABLED?.trim().toLowerCase() ===
    "true"
  );
}

function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1000).toISOString();
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function safeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Delayed GPay reconciliation failed.";
}

function parseJob(
  order: WooCommerceAdminOrder,
): GPayDelayedReconciliationJob | null {
  const raw = readWooCommerceOrderMetaString(order, META.job);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GPayDelayedReconciliationJob>;

    if (
      parsed.version !== "f04.2" &&
      parsed.version !== "f04.2.1" &&
      parsed.version !== "f04.3.2"
    ) {
      return null;
    }

    if (
      !parsed.verification ||
      typeof parsed.orderId !== "number" ||
      !parsed.state ||
      !parsed.automationMode ||
      !parsed.fulfillmentMode
    ) {
      return null;
    }

    const providerConfirmed = parsed.lastQueriedStatus === "SUCCESS";
    const commerceRetryDelaysSeconds =
      Array.isArray(parsed.commerceRetryDelaysSeconds) &&
      parsed.commerceRetryDelaysSeconds.length > 0
        ? parsed.commerceRetryDelaysSeconds
        : getGPayCommerceRetryDelaysSeconds();
    const fulfillmentPollDelaysSeconds =
      Array.isArray(parsed.fulfillmentPollDelaysSeconds) &&
      parsed.fulfillmentPollDelaysSeconds.length > 0
        ? parsed.fulfillmentPollDelaysSeconds
        : getGPayFulfillmentPollDelaysSeconds();
    const callback = parsed.verification.callback;
    const confirmedQuery =
      parsed.confirmedQuery ??
      (providerConfirmed
        ? {
            gpayTransactionId: callback.gpayTransactionId || "",
            status: "ORDER_SUCCESS",
            userPaymentMethod: callback.userPaymentMethod || "",
            queriedAt: parsed.updatedAt || nowIso(),
          }
        : null);

    return {
      ...(parsed as GPayDelayedReconciliationJob),
      version: "f04.3.2",
      attempts:
        Number.isInteger(parsed.attempts) && (parsed.attempts ?? 0) >= 0
          ? (parsed.attempts ?? 0)
          : 0,
      maxAttempts:
        Number.isInteger(parsed.maxAttempts) && (parsed.maxAttempts ?? 0) > 0
          ? (parsed.maxAttempts ?? 1)
          : getGPayReconciliationRetryDelaysSeconds().length,
      retryDelaysSeconds:
        Array.isArray(parsed.retryDelaysSeconds) &&
        parsed.retryDelaysSeconds.length > 0
          ? parsed.retryDelaysSeconds
          : getGPayReconciliationRetryDelaysSeconds(),
      commerceAttempts:
        Number.isInteger(parsed.commerceAttempts) &&
        (parsed.commerceAttempts ?? 0) >= 0
          ? (parsed.commerceAttempts ?? 0)
          : 0,
      maxCommerceAttempts:
        Number.isInteger(parsed.maxCommerceAttempts) &&
        (parsed.maxCommerceAttempts ?? 0) > 0
          ? (parsed.maxCommerceAttempts ?? 1)
          : commerceRetryDelaysSeconds.length,
      commerceRetryDelaysSeconds,
      fulfillmentPollAttempts:
        Number.isInteger(parsed.fulfillmentPollAttempts) &&
        (parsed.fulfillmentPollAttempts ?? 0) >= 0
          ? (parsed.fulfillmentPollAttempts ?? 0)
          : 0,
      maxFulfillmentPollAttempts:
        Number.isInteger(parsed.maxFulfillmentPollAttempts) &&
        (parsed.maxFulfillmentPollAttempts ?? 0) > 0
          ? (parsed.maxFulfillmentPollAttempts ?? 1)
          : fulfillmentPollDelaysSeconds.length,
      fulfillmentPollDelaysSeconds,
      providerConfirmedAt:
        parsed.providerConfirmedAt ??
        (providerConfirmed ? (parsed.updatedAt ?? nowIso()) : null),
      confirmedQuery,
      nextAttemptAt: parsed.nextAttemptAt ?? null,
      createdAt: parsed.createdAt ?? nowIso(),
      updatedAt: parsed.updatedAt ?? nowIso(),
      lastQueriedStatus: parsed.lastQueriedStatus ?? null,
      lastError: parsed.lastError ?? null,
      lockToken: null,
      lockExpiresAt: null,
      result: parsed.result ?? null,
    };
  } catch {
    return null;
  }
}

function view(
  job: GPayDelayedReconciliationJob,
): GPayDelayedReconciliationView {
  return {
    orderId: job.orderId,
    state: job.state,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    providerAttempts: job.attempts,
    commerceAttempts: job.commerceAttempts,
    maxCommerceAttempts: job.maxCommerceAttempts,
    fulfillmentPollAttempts: job.fulfillmentPollAttempts,
    maxFulfillmentPollAttempts: job.maxFulfillmentPollAttempts,
    providerConfirmed: job.lastQueriedStatus === "SUCCESS",
    providerConfirmedAt: job.providerConfirmedAt,
    nextAttemptAt: job.nextAttemptAt,
    automationMode: job.automationMode,
    fulfillmentMode: job.fulfillmentMode,
    lastQueriedStatus: job.lastQueriedStatus,
    lastError: job.lastError,
    result: job.result,
  };
}

async function persistJob(
  order: WooCommerceAdminOrder,
  job: GPayDelayedReconciliationJob,
): Promise<void> {
  const metadata = upsertWooCommerceOrderMeta(order, {
    [META.job]: JSON.stringify(job),
    [META.state]: job.state,
    [META.attempts]: job.attempts,
    [META.nextAt]: job.nextAttemptAt ?? "",
    [META.updatedAt]: job.updatedAt,
    [META.lastStatus]: job.lastQueriedStatus ?? "",
    [META.lastError]: job.lastError ?? "",
  });

  await updateWooCommerceAdminOrder(order.id, {
    meta_data: metadata,
  });
}

function storedVerification(
  verification: GPayGatewayCallbackVerification,
): StoredVerification {
  return {
    verified: true,
    verificationStrategy: String(verification.verificationStrategy),
    normalizedStatus: "SUCCESS",
    callback: {
      ...verification.callback,
      signature: "[VERIFIED_SIGNATURE_NOT_RETAINED]",
    },
    parsedEmbedData: verification.parsedEmbedData,
    canonicalSha256: verification.canonicalSha256,
    contractVersion: verification.contractVersion,
  };
}

function restoreVerification(
  stored: StoredVerification,
): GPayGatewayCallbackVerification {
  return stored as GPayGatewayCallbackVerification;
}

function expectedOrderIdentityMatches(
  order: WooCommerceAdminOrder,
  verification: GPayGatewayCallbackVerification,
): void {
  const embed = parseGPayCommerceEmbedData(verification);

  assertGPayCommerceOrderIdentity(order, embed);
}

export function isGPayDelayedReconciliationCandidate(
  verification: GPayGatewayCallbackVerification,
  reconciliation: GPayCallbackReconciliationResult,
): boolean {
  if (
    !verification.verified ||
    verification.normalizedStatus !== "SUCCESS" ||
    reconciliation.mode !== "query" ||
    reconciliation.attempted !== true ||
    reconciliation.queriedStatus === "SUCCESS" ||
    reconciliation.queriedStatus === "FAILED"
  ) {
    return false;
  }

  return (
    reconciliation.merchantOrderIdMatches !== false &&
    reconciliation.gpayBillIdMatches !== false &&
    reconciliation.embedDataMatches !== false
  );
}

export async function enqueueGPayDelayedReconciliation({
  verification,
  reconciliation,
  automationMode = getGPayCommerceAutomationMode(),
  fulfillmentMode = "live",
}: {
  verification: GPayGatewayCallbackVerification;
  reconciliation: GPayCallbackReconciliationResult;
  automationMode?: GPayCommerceAutomationMode;
  fulfillmentMode?: GigagoFulfillmentMode;
}): Promise<EnqueueGPayDelayedReconciliationResult> {
  if (automationMode === "disabled") {
    throw new Error(
      "Không tạo delayed reconciliation khi commerce automation đang disabled.",
    );
  }

  if (!isGPayDelayedReconciliationCandidate(verification, reconciliation)) {
    throw new Error("Callback GPay không đủ điều kiện delayed reconciliation.");
  }

  const embed = parseGPayCommerceEmbedData(verification);
  const order = await getWooCommerceAdminOrder(embed.orderId);

  assertGPayCommerceOrderIdentity(order, embed);

  const existing = parseJob(order);

  if (
    existing &&
    existing.verification.canonicalSha256 === verification.canonicalSha256
  ) {
    return {
      ...view(existing),
      duplicate: true,
      scheduleRecommended:
        existing.state === "pending" ||
        existing.state === "processing" ||
        existing.state === "pending-commerce" ||
        existing.state === "pending-fulfillment" ||
        existing.state === "provider-confirmed",
    };
  }

  const createdAt = nowIso();
  const delays = getGPayReconciliationRetryDelaysSeconds();
  const job: GPayDelayedReconciliationJob = {
    version: "f04.3.2",
    orderId: order.id,
    state: "pending",
    attempts: 0,
    maxAttempts: delays.length,
    retryDelaysSeconds: delays,
    commerceAttempts: 0,
    maxCommerceAttempts: getGPayCommerceRetryDelaysSeconds().length,
    commerceRetryDelaysSeconds: getGPayCommerceRetryDelaysSeconds(),
    fulfillmentPollAttempts: 0,
    maxFulfillmentPollAttempts: getGPayFulfillmentPollDelaysSeconds().length,
    fulfillmentPollDelaysSeconds: getGPayFulfillmentPollDelaysSeconds(),
    providerConfirmedAt: null,
    confirmedQuery: null,
    nextAttemptAt: addSeconds(createdAt, delays[0]),
    createdAt,
    updatedAt: createdAt,
    automationMode,
    fulfillmentMode,
    verification: storedVerification(verification),
    lastQueriedStatus: reconciliation.queriedStatus ?? null,
    lastError: null,
    lockToken: null,
    lockExpiresAt: null,
    result: null,
  };

  await persistJob(order, job);

  return {
    ...view(job),
    duplicate: false,
    scheduleRecommended: true,
  };
}

function syntheticQuery(
  job: GPayDelayedReconciliationJob,
  status: "PENDING" | "SUCCESS" | "FAILED",
): GPayDelayedQueryOverride {
  return {
    merchantOrderId: job.verification.callback.merchantOrderId,
    gpayBillId: job.verification.callback.gpayBillId,
    gpayTransactionId: status === "SUCCESS" ? `F04-2-TRANS-${job.orderId}` : "",
    status:
      status === "SUCCESS"
        ? "ORDER_SUCCESS"
        : status === "FAILED"
          ? "ORDER_FAILED"
          : "",
    embedData: job.verification.callback.embedData,
    userPaymentMethod: "F04_2_PROTECTED_TEST",
    queriedAt: nowIso(),
  };
}

async function providerQuery(
  job: GPayDelayedReconciliationJob,
  syntheticStatus?: "PENDING" | "SUCCESS" | "FAILED",
): Promise<GPayDelayedQueryOverride> {
  if (syntheticStatus) {
    return syntheticQuery(job, syntheticStatus);
  }

  const query: GPayGatewayQueryOrderResult = await queryGPayGatewayOrder({
    gpayBillId: job.verification.callback.gpayBillId,
    merchantOrderId: job.verification.callback.merchantOrderId,
  });

  return {
    merchantOrderId: query.merchantOrderId,
    gpayBillId: query.gpayBillId,
    gpayTransactionId: query.gpayTransactionId,
    status: query.status,
    embedData: query.embedData,
    userPaymentMethod: query.userPaymentMethod,
    queriedAt: query.queriedAt,
  };
}

function reconciliationFromQuery(
  job: GPayDelayedReconciliationJob,
  query: GPayDelayedQueryOverride,
): GPayCallbackReconciliationResult {
  const queriedStatus = normalizeGPayGatewayStatus(query.status ?? "");
  const merchantOrderIdMatches =
    query.merchantOrderId === job.verification.callback.merchantOrderId;
  const gpayBillIdMatches =
    query.gpayBillId === job.verification.callback.gpayBillId;
  const embedDataMatches =
    query.embedData == null ||
    query.embedData === job.verification.callback.embedData;
  const confirmed =
    merchantOrderIdMatches &&
    gpayBillIdMatches &&
    embedDataMatches &&
    queriedStatus === "SUCCESS";

  return {
    mode: "query",
    attempted: true,
    confirmed,
    reason: confirmed
      ? "DELAYED_QUERY_SUCCESS_CONFIRMED"
      : "DELAYED_QUERY_NOT_READY",
    callbackStatus: "SUCCESS",
    queriedStatus,
    merchantOrderIdMatches,
    gpayBillIdMatches,
    statusCompatible: queriedStatus === "SUCCESS",
    embedDataMatches,
    query: {
      status: query.status,
      gpayTransactionId: query.gpayTransactionId,
      userPaymentMethod: query.userPaymentMethod,
      queriedAt: query.queriedAt,
    },
  };
}

function resultSummary(
  result: GPayCommerceAutomationResult,
): GPayDelayedReconciliationJob["result"] {
  return {
    reason: result.reason,
    paymentRecorded: result.paymentRecorded,
    commerceStateChanged: result.commerceStateChanged,
    fulfillmentAttempted: result.fulfillmentAttempted,
    fulfillmentSucceeded: result.fulfillmentSucceeded,
    fulfillmentState: result.fulfillmentState,
    fulfillmentAssessment: result.fulfillmentAssessment,
    paymentDiagnostic: result.paymentDiagnostic,
  };
}

function confirmedReconciliation(
  job: GPayDelayedReconciliationJob,
): GPayCallbackReconciliationResult {
  const query = job.confirmedQuery ?? {
    gpayTransactionId: job.verification.callback.gpayTransactionId || "",
    status: "ORDER_SUCCESS",
    userPaymentMethod: job.verification.callback.userPaymentMethod || "",
    queriedAt: job.providerConfirmedAt ?? nowIso(),
  };

  return {
    mode: "query",
    attempted: true,
    confirmed: true,
    reason: "DELAYED_QUERY_SUCCESS_CONFIRMED",
    callbackStatus: "SUCCESS",
    queriedStatus: "SUCCESS",
    merchantOrderIdMatches: true,
    gpayBillIdMatches: true,
    statusCompatible: true,
    embedDataMatches: true,
    query,
  };
}

async function persistAndView(
  orderId: number,
  job: GPayDelayedReconciliationJob,
): Promise<GPayDelayedReconciliationView> {
  const refreshed = await getWooCommerceAdminOrder(orderId);
  await persistJob(refreshed, job);

  return view(job);
}

async function applyConfirmedCommerce(
  orderId: number,
  job: GPayDelayedReconciliationJob,
  options: ProcessGPayDelayedReconciliationOptions,
): Promise<GPayDelayedReconciliationView> {
  const verification = restoreVerification(job.verification);
  const currentOrder = await getWooCommerceAdminOrder(orderId);
  const resumingFulfillment = job.state === "pending-fulfillment";

  expectedOrderIdentityMatches(currentOrder, verification);

  job.state = "processing";
  job.updatedAt = nowIso();
  job.lockToken = randomUUID();
  job.lockExpiresAt = addSeconds(job.updatedAt, 45);
  job.nextAttemptAt = null;
  await persistJob(currentOrder, job);

  try {
    if (!resumingFulfillment) {
      job.commerceAttempts += 1;
    }

    const automation = await runGPayCommerceAutomation(
      verification,
      confirmedReconciliation(job),
      {
        modeOverride: job.automationMode,
        fulfillmentModeOverride: job.fulfillmentMode,
        source:
          options.syntheticStatus != null
            ? "protected-reconciliation-test"
            : "gpay-reconciliation-retry",
      },
    );

    job.result = resultSummary(automation);
    job.updatedAt = nowIso();
    job.lockToken = null;
    job.lockExpiresAt = null;
    job.nextAttemptAt = null;

    if (automation.paymentRecorded && !automation.fulfillmentAttempted) {
      job.state = "succeeded";
      job.lastError = null;
    } else if (
      automation.paymentRecorded &&
      automation.fulfillmentSucceeded === true
    ) {
      job.state = "succeeded";
      job.lastError = null;
    } else if (
      automation.paymentRecorded &&
      automation.fulfillmentAttempted &&
      automation.fulfillmentSucceeded === null
    ) {
      job.fulfillmentPollAttempts += 1;

      if (job.fulfillmentPollAttempts >= job.maxFulfillmentPollAttempts) {
        job.state = "action-required";
        job.nextAttemptAt = null;
        job.lastError =
          "Gigago vẫn chưa Delivered sau toàn bộ số lần fulfillment polling.";
      } else {
        const delay =
          job.fulfillmentPollDelaysSeconds[
            Math.min(
              job.fulfillmentPollAttempts - 1,
              job.fulfillmentPollDelaysSeconds.length - 1,
            )
          ];
        job.state = "pending-fulfillment";
        job.nextAttemptAt = addSeconds(nowIso(), delay);
        job.lastError = null;
      }
    } else {
      job.lastError =
        automation.fulfillmentError?.message ??
        "Commerce automation không hoàn tất.";

      if (job.commerceAttempts >= job.maxCommerceAttempts) {
        job.state = "action-required";
        job.nextAttemptAt = null;
      } else {
        const delay =
          job.commerceRetryDelaysSeconds[
            Math.min(
              job.commerceAttempts - 1,
              job.commerceRetryDelaysSeconds.length - 1,
            )
          ];
        job.state = "pending-commerce";
        job.nextAttemptAt = addSeconds(nowIso(), delay);
      }
    }

    return persistAndView(orderId, job);
  } catch (error) {
    job.updatedAt = nowIso();
    job.lockToken = null;
    job.lockExpiresAt = null;
    job.lastError = safeError(error);

    if (resumingFulfillment) {
      job.fulfillmentPollAttempts += 1;

      if (job.fulfillmentPollAttempts >= job.maxFulfillmentPollAttempts) {
        job.state = "action-required";
        job.nextAttemptAt = null;
      } else {
        const delay =
          job.fulfillmentPollDelaysSeconds[
            Math.min(
              job.fulfillmentPollAttempts - 1,
              job.fulfillmentPollDelaysSeconds.length - 1,
            )
          ];
        job.state = "pending-fulfillment";
        job.nextAttemptAt = addSeconds(nowIso(), delay);
      }
    } else if (job.commerceAttempts >= job.maxCommerceAttempts) {
      job.state = "action-required";
      job.nextAttemptAt = null;
    } else {
      const delay =
        job.commerceRetryDelaysSeconds[
          Math.min(
            job.commerceAttempts - 1,
            job.commerceRetryDelaysSeconds.length - 1,
          )
        ];
      job.state = "pending-commerce";
      job.nextAttemptAt = addSeconds(nowIso(), delay);
    }

    return persistAndView(orderId, job);
  }
}

async function processUnlocked(
  orderId: number,
  options: ProcessGPayDelayedReconciliationOptions,
): Promise<GPayDelayedReconciliationView> {
  const order = await getWooCommerceAdminOrder(orderId);
  const job = parseJob(order);

  if (!job) {
    throw new Error(
      `Woo order ${orderId} không có delayed reconciliation job.`,
    );
  }

  if (
    job.state === "succeeded" ||
    job.state === "failed" ||
    job.state === "mismatch" ||
    job.state === "action-required"
  ) {
    return view(job);
  }

  if (
    job.state === "exhausted" &&
    !(options.force && job.lastQueriedStatus === "SUCCESS")
  ) {
    return view(job);
  }

  if (
    !options.force &&
    job.nextAttemptAt &&
    Date.parse(job.nextAttemptAt) > Date.now()
  ) {
    return view(job);
  }

  if (job.lastQueriedStatus === "SUCCESS") {
    return applyConfirmedCommerce(orderId, job, options);
  }

  const processingAt = nowIso();
  job.state = "processing";
  job.updatedAt = processingAt;
  job.lockToken = randomUUID();
  job.lockExpiresAt = addSeconds(processingAt, 45);

  await persistJob(order, job);

  try {
    const query = await providerQuery(job, options.syntheticStatus);
    const reconciliation = reconciliationFromQuery(job, query);
    const queriedStatus = reconciliation.queriedStatus ?? "PENDING";

    job.attempts += 1;
    job.lastQueriedStatus = queriedStatus;
    job.lastError = null;
    job.updatedAt = nowIso();
    job.lockToken = null;
    job.lockExpiresAt = null;

    if (
      reconciliation.merchantOrderIdMatches === false ||
      reconciliation.gpayBillIdMatches === false ||
      reconciliation.embedDataMatches === false
    ) {
      job.state = "mismatch";
      job.nextAttemptAt = null;
      job.lastError =
        "GPay query identity/embed_data không khớp callback đã xác minh.";

      return persistAndView(orderId, job);
    }

    if (queriedStatus === "FAILED") {
      job.state = "failed";
      job.nextAttemptAt = null;
      job.lastError = "GPay query trả trạng thái thất bại.";

      return persistAndView(orderId, job);
    }

    if (queriedStatus === "SUCCESS") {
      job.state = "provider-confirmed";
      job.providerConfirmedAt = query.queriedAt;
      job.confirmedQuery = {
        gpayTransactionId: query.gpayTransactionId || "",
        status: query.status || "ORDER_SUCCESS",
        userPaymentMethod: query.userPaymentMethod || "",
        queriedAt: query.queriedAt,
      };
      job.nextAttemptAt = null;

      await persistAndView(orderId, job);

      return applyConfirmedCommerce(orderId, job, options);
    }

    if (job.attempts >= job.maxAttempts) {
      job.state = "exhausted";
      job.nextAttemptAt = null;
      job.lastError = "GPay query chưa SUCCESS sau toàn bộ số lần retry.";
    } else {
      const nextDelay =
        job.retryDelaysSeconds[
          Math.min(job.attempts, job.retryDelaysSeconds.length - 1)
        ];
      job.state = "pending";
      job.nextAttemptAt = addSeconds(nowIso(), nextDelay);
    }

    return persistAndView(orderId, job);
  } catch (error) {
    job.attempts += 1;
    job.updatedAt = nowIso();
    job.lockToken = null;
    job.lockExpiresAt = null;
    job.lastError = safeError(error);

    if (job.attempts >= job.maxAttempts) {
      job.state = "exhausted";
      job.nextAttemptAt = null;
    } else {
      const nextDelay =
        job.retryDelaysSeconds[
          Math.min(job.attempts, job.retryDelaysSeconds.length - 1)
        ];
      job.state = "pending";
      job.nextAttemptAt = addSeconds(nowIso(), nextDelay);
    }

    return persistAndView(orderId, job);
  }
}

export async function processGPayDelayedReconciliation(
  orderId: number,
  options: ProcessGPayDelayedReconciliationOptions = {},
): Promise<GPayDelayedReconciliationView> {
  const active = processing.get(orderId);

  if (active) {
    return active;
  }

  const task = processUnlocked(orderId, options).finally(() => {
    processing.delete(orderId);
  });

  processing.set(orderId, task);

  return task;
}

export async function getGPayDelayedReconciliationStatus(
  orderId: number,
): Promise<GPayDelayedReconciliationView | null> {
  const order = await getWooCommerceAdminOrder(orderId);
  const job = parseJob(order);

  return job ? view(job) : null;
}

export async function runGPayDelayedReconciliationSchedule(
  orderId: number,
): Promise<GPayDelayedReconciliationView | null> {
  while (true) {
    const current = await getGPayDelayedReconciliationStatus(orderId);

    if (!current) {
      return null;
    }

    if (
      current.state === "succeeded" ||
      current.state === "failed" ||
      current.state === "mismatch" ||
      current.state === "exhausted" ||
      current.state === "action-required"
    ) {
      return current;
    }

    const waitUntil = current.nextAttemptAt
      ? Date.parse(current.nextAttemptAt)
      : Date.now();
    const waitMilliseconds = Math.max(0, waitUntil - Date.now());

    if (waitMilliseconds > 0) {
      await sleep(waitMilliseconds);
    }

    await processGPayDelayedReconciliation(orderId, {
      force: true,
    });
  }
}
