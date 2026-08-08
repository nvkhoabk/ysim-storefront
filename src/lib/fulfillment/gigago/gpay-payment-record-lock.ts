import path from "node:path";

import {
  acquireDurableOperationLock,
  DurableOperationLockError,
  type DurableOperationLock,
} from "@/lib/runtime/durable-operation-lock";

export class GPayPaymentRecordLockError extends Error {
  readonly code:
    "GPAY_PAYMENT_RECORD_IN_PROGRESS" | "GPAY_PAYMENT_RECORD_LOCK_INVALID";

  constructor(
    code:
      "GPAY_PAYMENT_RECORD_IN_PROGRESS" | "GPAY_PAYMENT_RECORD_LOCK_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "GPayPaymentRecordLockError";
    this.code = code;
  }
}

function lockDirectory(): string {
  const configured = process.env.GPAY_PAYMENT_RECORD_LOCK_DIR?.trim();

  if (configured) {
    if (!path.isAbsolute(configured)) {
      throw new GPayPaymentRecordLockError(
        "GPAY_PAYMENT_RECORD_LOCK_INVALID",
        "GPAY_PAYMENT_RECORD_LOCK_DIR phải là đường dẫn tuyệt đối.",
      );
    }

    return configured;
  }

  if (
    process.env.NODE_ENV?.trim().toLowerCase() === "production" &&
    process.env.YSIM_RUNTIME_ENVIRONMENT?.trim().toLowerCase() !== "sandbox"
  ) {
    return "/var/www/ysim.vn/storefront/shared/state/locks";
  }

  return path.join(process.cwd(), ".runtime", "locks");
}

function configuredInteger(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new GPayPaymentRecordLockError(
      "GPAY_PAYMENT_RECORD_LOCK_INVALID",
      `${name} phải nằm trong khoảng ${minimum}..${maximum}.`,
    );
  }

  return value;
}

export async function acquireGPayPaymentRecordLock(
  orderId: number,
): Promise<DurableOperationLock> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new GPayPaymentRecordLockError(
      "GPAY_PAYMENT_RECORD_LOCK_INVALID",
      "Order ID dùng cho payment record lock không hợp lệ.",
    );
  }

  try {
    return await acquireDurableOperationLock({
      directory: lockDirectory(),
      namespace: "gpay-payment-record",
      resource: `order-${orderId}`,
      staleAfterMs: configuredInteger(
        "GPAY_PAYMENT_RECORD_LOCK_STALE_MS",
        300_000,
        30_000,
        86_400_000,
      ),
      waitTimeoutMs: configuredInteger(
        "GPAY_PAYMENT_RECORD_LOCK_WAIT_MS",
        15_000,
        0,
        60_000,
      ),
      retryIntervalMs: 50,
    });
  } catch (error) {
    if (error instanceof DurableOperationLockError) {
      if (error.code === "DURABLE_OPERATION_LOCK_BUSY") {
        throw new GPayPaymentRecordLockError(
          "GPAY_PAYMENT_RECORD_IN_PROGRESS",
          "Payment callback của order này đang được một worker khác xử lý.",
        );
      }

      throw new GPayPaymentRecordLockError(
        "GPAY_PAYMENT_RECORD_LOCK_INVALID",
        error.message,
      );
    }

    throw error;
  }
}
