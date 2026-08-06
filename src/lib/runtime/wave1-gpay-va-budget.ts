import { constants as fsConstants } from "node:fs";
import { lstat, open, readFile } from "node:fs/promises";

import {
  type Wave1GPayVACanaryPolicy,
  Wave1GPayVACanaryError,
} from "./wave1-gpay-va-canary";

interface ArmedBudgetContract {
  readonly contractVersion: "f07-wave1-gpay-va-canary-budget-v1";
  readonly state: "armed";
  readonly provider: "gpay_virtual_account";
  readonly orderId: number;
  readonly amountVnd: number;
  readonly hardMaxAmountVnd: 200000;
  readonly maxCreateCalls: 1;
}

function isArmedBudgetContract(value: unknown): value is ArmedBudgetContract {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const expectedKeys = [
    "amountVnd",
    "contractVersion",
    "hardMaxAmountVnd",
    "maxCreateCalls",
    "orderId",
    "provider",
    "state",
  ];

  return (
    JSON.stringify(Object.keys(record).sort()) ===
      JSON.stringify(expectedKeys) &&
    record.contractVersion === "f07-wave1-gpay-va-canary-budget-v1" &&
    record.state === "armed" &&
    record.provider === "gpay_virtual_account" &&
    Number.isSafeInteger(record.orderId) &&
    Number.isSafeInteger(record.amountVnd) &&
    record.hardMaxAmountVnd === 200000 &&
    record.maxCreateCalls === 1
  );
}

async function readArmedBudget(
  policy: Wave1GPayVACanaryPolicy,
): Promise<ArmedBudgetContract> {
  try {
    const details = await lstat(policy.budgetFile);
    const runtimeUid = process.getuid?.();

    if (
      !details.isFile() ||
      details.isSymbolicLink() ||
      (details.mode & 0o777) !== 0o600 ||
      details.size <= 0 ||
      details.size > 4096 ||
      runtimeUid === undefined ||
      details.uid !== runtimeUid
    ) {
      throw new Wave1GPayVACanaryError(
        "WAVE1_CANARY_BUDGET_FILE_INVALID",
        "Canary budget file phải là regular file nhỏ, mode 0600, do runtime user sở hữu.",
        503,
      );
    }

    const parsed: unknown = JSON.parse(
      await readFile(policy.budgetFile, "utf8"),
    );

    if (
      !isArmedBudgetContract(parsed) ||
      parsed.provider !== policy.provider ||
      parsed.orderId !== policy.orderId ||
      parsed.amountVnd !== policy.amountVnd ||
      parsed.hardMaxAmountVnd !== policy.hardMaxAmountVnd
    ) {
      throw new Wave1GPayVACanaryError(
        "WAVE1_CANARY_BUDGET_CONTRACT_MISMATCH",
        "Canary budget file không khớp policy runtime.",
        503,
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof Wave1GPayVACanaryError) {
      throw error;
    }

    throw new Wave1GPayVACanaryError(
      "WAVE1_CANARY_BUDGET_IO_ERROR",
      "Không thể đọc canary budget file; provider call bị chặn.",
      503,
    );
  }
}

export async function claimWave1GPayVACanaryBudget(
  policy: Wave1GPayVACanaryPolicy | null,
): Promise<void> {
  if (!policy) {
    return;
  }

  await readArmedBudget(policy);
  const claimFile = `${policy.budgetFile}.claimed`;
  let handle: Awaited<ReturnType<typeof open>> | undefined;

  try {
    handle = await open(
      claimFile,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_WRONLY |
        fsConstants.O_NOFOLLOW,
      0o600,
    );
    await handle.writeFile(
      `${JSON.stringify({
        contractVersion: "f07-wave1-gpay-va-canary-claim-v1",
        state: "claimed",
        provider: policy.provider,
        orderId: policy.orderId,
        amountVnd: policy.amountVnd,
        claimedAtUtc: new Date().toISOString(),
      })}\n`,
      "utf8",
    );
    await handle.sync();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Wave1GPayVACanaryError(
        "WAVE1_CANARY_BUDGET_ALREADY_CONSUMED",
        "Canary budget đã được claim; không được gọi create VA lần thứ hai.",
      );
    }

    throw error;
  } finally {
    await handle?.close();
  }
}
