import path from "node:path";

import {
  acquireDurableOperationLock,
  DurableOperationLockError,
} from "#durable-operation-lock";

export class GPayVACreateLockError extends Error {
  readonly code: "GPAY_VA_CREATE_IN_PROGRESS" | "GPAY_VA_CREATE_LOCK_INVALID";
  readonly status = 409;

  constructor(
    code: "GPAY_VA_CREATE_IN_PROGRESS" | "GPAY_VA_CREATE_LOCK_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "GPayVACreateLockError";
    this.code = code;
  }
}

export interface GPayVACreateLock {
  readonly path: string;
  readonly reclaimedStaleLock: boolean;
  release(): Promise<void>;
}

function lockDirectory(): string {
  const configured = process.env.GPAY_VA_CREATE_LOCK_DIR?.trim();

  if (configured) {
    if (!path.isAbsolute(configured)) {
      throw new GPayVACreateLockError(
        "GPAY_VA_CREATE_LOCK_INVALID",
        "GPAY_VA_CREATE_LOCK_DIR phải là đường dẫn tuyệt đối.",
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

function staleAfterMs(): number {
  const configured = Number(
    process.env.GPAY_VA_CREATE_LOCK_STALE_MS ?? 300_000,
  );

  if (
    !Number.isSafeInteger(configured) ||
    configured < 30_000 ||
    configured > 86_400_000
  ) {
    throw new GPayVACreateLockError(
      "GPAY_VA_CREATE_LOCK_INVALID",
      "GPAY_VA_CREATE_LOCK_STALE_MS phải nằm trong khoảng 30000..86400000.",
    );
  }

  return configured;
}

export async function acquireGPayVACreateLock(
  orderId: number,
): Promise<GPayVACreateLock> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new GPayVACreateLockError(
      "GPAY_VA_CREATE_LOCK_INVALID",
      "Order ID dùng cho GPay VA lock không hợp lệ.",
    );
  }

  try {
    return await acquireDurableOperationLock({
      directory: lockDirectory(),
      namespace: "gpay-va-create",
      resource: `order-${orderId}`,
      staleAfterMs: staleAfterMs(),
    });
  } catch (error) {
    if (error instanceof DurableOperationLockError) {
      if (error.code === "DURABLE_OPERATION_LOCK_BUSY") {
        throw new GPayVACreateLockError(
          "GPAY_VA_CREATE_IN_PROGRESS",
          "Yêu cầu tạo tài khoản ảo cho đơn hàng này đang được xử lý. Không gửi lại để tránh tạo VA trùng.",
        );
      }

      throw new GPayVACreateLockError(
        "GPAY_VA_CREATE_LOCK_INVALID",
        error.message,
      );
    }

    throw error;
  }
}
