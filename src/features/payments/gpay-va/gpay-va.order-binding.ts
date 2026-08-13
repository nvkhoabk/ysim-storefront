import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { lstat, mkdir, open, unlink } from "node:fs/promises";
import path from "node:path";

export class GPayVAOrderBindingError extends Error {
  readonly code:
    | "GPAY_VA_ORDER_BINDING_INVALID"
    | "GPAY_VA_ORDER_BINDING_NOT_FOUND"
    | "GPAY_VA_ORDER_BINDING_CONFLICT";

  constructor(
    code:
      | "GPAY_VA_ORDER_BINDING_INVALID"
      | "GPAY_VA_ORDER_BINDING_NOT_FOUND"
      | "GPAY_VA_ORDER_BINDING_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "GPayVAOrderBindingError";
    this.code = code;
  }
}

export interface GPayVAOrderBinding {
  readonly orderId: number;
  readonly reference: string;
  readonly equalAmount: number;
}

interface GPayVAOrderBindingRecord extends GPayVAOrderBinding {
  readonly version: "gpay-va-order-binding-v1";
  readonly accountNumberSha256: string;
  readonly createdAt: string;
}

const ACCOUNT_NUMBER_PATTERN = /^[A-Za-z0-9]{6,64}$/u;
const REFERENCE_PATTERN = /^YSIM-([1-9][0-9]*)-[A-Za-z0-9_-]+$/u;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;

function normalizedAccountNumber(value: string): string {
  const normalized = value.trim();

  if (!ACCOUNT_NUMBER_PATTERN.test(normalized)) {
    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Số tài khoản Virtual Account không hợp lệ.",
    );
  }

  return normalized;
}

function accountNumberSha256(accountNumber: string): string {
  return createHash("sha256").update(accountNumber, "utf8").digest("hex");
}

function assertBinding(binding: GPayVAOrderBinding): void {
  const referenceMatch = binding.reference.match(REFERENCE_PATTERN);

  if (
    !Number.isSafeInteger(binding.orderId) ||
    binding.orderId <= 0 ||
    !referenceMatch ||
    Number(referenceMatch[1]) !== binding.orderId ||
    !Number.isSafeInteger(binding.equalAmount) ||
    binding.equalAmount <= 0
  ) {
    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Contract liên kết GPay VA với đơn hàng không hợp lệ.",
    );
  }
}

function orderBindingDirectory(): string {
  const configured = process.env.GPAY_VA_ORDER_INDEX_DIR?.trim();

  if (configured) {
    if (!path.isAbsolute(configured)) {
      throw new GPayVAOrderBindingError(
        "GPAY_VA_ORDER_BINDING_INVALID",
        "GPAY_VA_ORDER_INDEX_DIR phải là đường dẫn tuyệt đối.",
      );
    }

    return configured;
  }

  if (process.env.NODE_ENV?.trim().toLowerCase() === "production") {
    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Thiếu GPAY_VA_ORDER_INDEX_DIR cho runtime production.",
    );
  }

  return path.join(process.cwd(), ".runtime", "gpay-va-order-index");
}

async function ensureDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 });

  const directoryStat = await lstat(directory);

  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Thư mục chỉ mục GPay VA không hợp lệ.",
    );
  }
}

function recordIsValid(
  value: unknown,
  expectedSha256: string,
): value is GPayVAOrderBindingRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<GPayVAOrderBindingRecord>;
  const referenceMatch =
    typeof record.reference === "string"
      ? record.reference.match(REFERENCE_PATTERN)
      : null;

  return (
    record.version === "gpay-va-order-binding-v1" &&
    typeof record.accountNumberSha256 === "string" &&
    SHA256_PATTERN.test(record.accountNumberSha256) &&
    record.accountNumberSha256 === expectedSha256 &&
    Number.isSafeInteger(record.orderId) &&
    Number(record.orderId) > 0 &&
    Boolean(referenceMatch) &&
    Number(referenceMatch?.[1]) === record.orderId &&
    Number.isSafeInteger(record.equalAmount) &&
    Number(record.equalAmount) > 0 &&
    typeof record.createdAt === "string" &&
    !Number.isNaN(Date.parse(record.createdAt))
  );
}

async function readRecord(
  recordPath: string,
  expectedSha256: string,
): Promise<GPayVAOrderBindingRecord> {
  let handle: Awaited<ReturnType<typeof open>>;

  try {
    handle = await open(
      recordPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new GPayVAOrderBindingError(
        "GPAY_VA_ORDER_BINDING_NOT_FOUND",
        "Không tìm thấy liên kết đơn hàng cho Virtual Account.",
      );
    }

    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Không thể đọc liên kết đơn hàng cho Virtual Account an toàn.",
    );
  }

  try {
    const recordStat = await handle.stat();

    if (!recordStat.isFile()) {
      throw new GPayVAOrderBindingError(
        "GPAY_VA_ORDER_BINDING_INVALID",
        "Liên kết đơn hàng cho Virtual Account không phải regular file.",
      );
    }

    const parsed = JSON.parse(await handle.readFile("utf8")) as unknown;

    if (!recordIsValid(parsed, expectedSha256)) {
      throw new GPayVAOrderBindingError(
        "GPAY_VA_ORDER_BINDING_INVALID",
        "Liên kết đơn hàng cho Virtual Account sai contract.",
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof GPayVAOrderBindingError) {
      throw error;
    }

    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Liên kết đơn hàng cho Virtual Account không chứa JSON hợp lệ.",
    );
  } finally {
    await handle.close();
  }
}

function sameBinding(
  record: GPayVAOrderBindingRecord,
  binding: GPayVAOrderBinding,
): boolean {
  return (
    record.orderId === binding.orderId &&
    record.reference === binding.reference &&
    record.equalAmount === binding.equalAmount
  );
}

export async function persistGPayVAOrderBinding({
  accountNumber,
  ...binding
}: GPayVAOrderBinding & { readonly accountNumber: string }): Promise<void> {
  const normalized = normalizedAccountNumber(accountNumber);
  assertBinding(binding);

  const directory = orderBindingDirectory();
  const digest = accountNumberSha256(normalized);
  const recordPath = path.join(directory, `${digest}.json`);
  const record: GPayVAOrderBindingRecord = {
    version: "gpay-va-order-binding-v1",
    accountNumberSha256: digest,
    ...binding,
    createdAt: new Date().toISOString(),
  };

  await ensureDirectory(directory);

  let handle: Awaited<ReturnType<typeof open>>;

  try {
    handle = await open(
      recordPath,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_WRONLY |
        fsConstants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      const existing = await readRecord(recordPath, digest);

      if (sameBinding(existing, binding)) {
        return;
      }

      throw new GPayVAOrderBindingError(
        "GPAY_VA_ORDER_BINDING_CONFLICT",
        "Virtual Account đã được liên kết với contract đơn hàng khác.",
      );
    }

    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Không thể tạo liên kết đơn hàng cho Virtual Account.",
    );
  }

  try {
    await handle.writeFile(`${JSON.stringify(record)}\n`, "utf8");
    await handle.sync();
  } catch {
    await handle.close().catch(() => undefined);
    await unlink(recordPath).catch(() => undefined);

    throw new GPayVAOrderBindingError(
      "GPAY_VA_ORDER_BINDING_INVALID",
      "Không thể ghi bền vững liên kết đơn hàng cho Virtual Account.",
    );
  }

  await handle.close();
}

export async function resolveGPayVAOrderBinding(
  accountNumber: string,
): Promise<GPayVAOrderBinding> {
  const normalized = normalizedAccountNumber(accountNumber);
  const digest = accountNumberSha256(normalized);
  const recordPath = path.join(orderBindingDirectory(), `${digest}.json`);
  const record = await readRecord(recordPath, digest);

  return {
    orderId: record.orderId,
    reference: record.reference,
    equalAmount: record.equalAmount,
  };
}
