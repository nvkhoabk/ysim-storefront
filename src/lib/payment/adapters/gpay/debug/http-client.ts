import {
  randomUUID,
} from "node:crypto";

import {
  writeGPayDebugEvent,
} from "./logger";

export interface GPayFetchOptions
  extends RequestInit {
  operation: string;

  requestId?: string;

  timeoutMs?: number;
}

export interface GPayHttpResult {
  requestId: string;

  response: Response;

  rawText: string;

  body: unknown;

  durationMs: number;
}

function headersToRecord(
  headers: Headers,
): Record<string, string> {
  return Object.fromEntries(
    Array.from(headers.entries()),
  );
}

function parseRequestBody(
  body: BodyInit | null | undefined,
): unknown {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }

  return {
    type:
      body.constructor?.name ??
      typeof body,
  };
}

function parseResponseBody(
  rawText: string,
): unknown {
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return rawText;
  }
}

export async function gpayFetch(
  url: string,
  options: GPayFetchOptions,
): Promise<GPayHttpResult> {
  const requestId =
    options.requestId ??
    randomUUID();

  const startedAt = Date.now();

  const controller =
    new AbortController();

  const timeoutMs =
    options.timeoutMs ?? 15_000;

  const timeoutHandle =
    setTimeout(
      () => controller.abort(),
      timeoutMs,
    );

  const requestHeaders =
    new Headers(options.headers);

  await writeGPayDebugEvent({
    type: "http.request",
    requestId,
    operation: options.operation,

    data: {
      method:
        options.method ?? "GET",

      url,

      headers:
        headersToRecord(
          requestHeaders,
        ),

      body:
        process.env
          .GPAY_DEBUG_LOG_BODY ===
        "true"
          ? parseRequestBody(
              options.body,
            )
          : "[BODY_LOGGING_DISABLED]",
    },
  });

  try {
    const response = await fetch(
      url,
      {
        ...options,

        signal:
          options.signal ??
          controller.signal,
      },
    );

    const rawText =
      await response.text();

    const parsedBody =
      parseResponseBody(rawText);

    const durationMs =
      Date.now() - startedAt;

    await writeGPayDebugEvent({
      type: "http.response",
      requestId,
      operation: options.operation,

      data: {
        status:
          response.status,

        statusText:
          response.statusText,

        durationMs,

        headers:
          headersToRecord(
            response.headers,
          ),

        body:
          process.env
            .GPAY_DEBUG_LOG_BODY ===
          "true"
            ? parsedBody
            : "[BODY_LOGGING_DISABLED]",
      },
    });

    return {
      requestId,
      response,
      rawText,
      body: parsedBody,
      durationMs,
    };
  } catch (error) {
    const durationMs =
      Date.now() - startedAt;

    await writeGPayDebugEvent({
      type: "http.error",
      requestId,
      operation: options.operation,

      data: {
        durationMs,

        error:
          error instanceof Error
            ? {
                name:
                  error.name,
                message:
                  error.message,
              }
            : {
                message:
                  "Unknown error",
              },
      },
    });

    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
