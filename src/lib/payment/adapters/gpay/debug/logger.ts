import {
  appendFile,
  mkdir,
} from "node:fs/promises";

import path from "node:path";

import {
  redactUnknown,
} from "./redact";

export type GPayDebugEventType =
  | "http.request"
  | "http.response"
  | "http.error"
  | "webhook.received"
  | "webhook.parsed"
  | "webhook.response"
  | "payment.event";

export interface GPayDebugEvent {
  type: GPayDebugEventType;

  requestId?: string;

  operation?: string;

  data?: unknown;
}

function isDebugEnabled(): boolean {
  return (
    process.env.GPAY_DEBUG_ENABLED ===
    "true"
  );
}

function getLogDirectory(): string {
  return (
    process.env.GPAY_DEBUG_LOG_DIR?.trim() ||
    "/var/log/ysim/gpay"
  );
}

function getMaximumBodyLength(): number {
  const value = Number.parseInt(
    process.env
      .GPAY_DEBUG_MAX_BODY_LENGTH ??
      "12000",
    10,
  );

  return Number.isFinite(value) &&
    value > 0
    ? value
    : 12_000;
}

function buildLogFilePath(
  date: Date,
): string {
  const day =
    date.toISOString().slice(0, 10);

  return path.join(
    getLogDirectory(),
    `gpay-${day}.jsonl`,
  );
}

export async function writeGPayDebugEvent(
  event: GPayDebugEvent,
): Promise<void> {
  if (!isDebugEnabled()) {
    return;
  }

  const now = new Date();

  const entry = {
    timestamp: now.toISOString(),

    service: "ysim-storefront",

    environment:
      process.env.GPAY_ENVIRONMENT ??
      "sandbox",

    ...event,

    data: redactUnknown(event.data, {
      maxStringLength:
        getMaximumBodyLength(),
    }),
  };

  try {
    await mkdir(
      getLogDirectory(),
      {
        recursive: true,
        mode: 0o750,
      },
    );

    await appendFile(
      buildLogFilePath(now),
      `${JSON.stringify(entry)}\n`,
      {
        encoding: "utf8",
        mode: 0o640,
      },
    );
  } catch (error) {
    /*
     * Không để lỗi ghi debug log
     * làm hỏng luồng thanh toán.
     */
    console.error(
      "Unable to write GPay debug log:",
      error instanceof Error
        ? error.message
        : "unknown error",
    );
  }
}
