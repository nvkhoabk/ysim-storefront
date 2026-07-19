import {
  createHash,
  randomUUID,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  writeGPayDebugEvent,
} from "@/lib/payment/adapters/gpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function headersToRecord(
  headers: Headers,
): Record<string, string> {
  return Object.fromEntries(
    Array.from(headers.entries()),
  );
}

function parseWebhookBody(
  rawBody: string,
  contentType: string,
): unknown {
  if (!rawBody) {
    return null;
  }

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      return JSON.parse(
        rawBody,
      ) as unknown;
    } catch {
      return {
        parseError:
          "INVALID_JSON",
        rawBody,
      };
    }
  }

  if (
    contentType.includes(
      "application/x-www-form-urlencoded",
    )
  ) {
    return Object.fromEntries(
      new URLSearchParams(
        rawBody,
      ).entries(),
    );
  }

  return rawBody;
}

function getFirstHeader(
  headers: Headers,
  names: string[],
): string | null {
  for (const name of names) {
    const value =
      headers.get(name);

    if (value) {
      return value;
    }
  }

  return null;
}

export async function POST(
  request: Request,
) {
  const localRequestId =
    randomUUID();

  const receivedAt =
    new Date().toISOString();

  const rawBody =
    await request.text();

  const contentType =
    request.headers.get(
      "content-type",
    ) ?? "";

  const parsedBody =
    parseWebhookBody(
      rawBody,
      contentType,
    );

  const rawBodySha256 =
    createHash("sha256")
      .update(rawBody, "utf8")
      .digest("hex");

  const signature =
    getFirstHeader(
      request.headers,
      [
        "signature",
        "x-signature",
        "x-gpay-signature",
        "webhook-signature",
      ],
    );

  const certificate =
    getFirstHeader(
      request.headers,
      [
        "x-certificate",
        "certificate",
        "x-gpay-certificate",
      ],
    );

  const providerRequestId =
    getFirstHeader(
      request.headers,
      [
        "x-request-id",
        "x-requests-id",
        "request-id",
        "webhook-id",
      ],
    );

  const providerTimestamp =
    getFirstHeader(
      request.headers,
      [
        "x-timestamp",
        "timestamp",
        "webhook-timestamp",
      ],
    );

  await writeGPayDebugEvent({
    type: "webhook.received",

    requestId:
      providerRequestId ??
      localRequestId,

    operation:
      "gpay.webhook",

    data: {
      localRequestId,

      providerRequestId,

      receivedAt,

      method:
        request.method,

      url:
        request.url,

      contentType,

      contentLength:
        rawBody.length,

      rawBodySha256,

      headers:
        headersToRecord(
          request.headers,
        ),

      detection: {
        hasSignature:
          Boolean(signature),

        signatureHeader:
          signature
            ? "detected"
            : null,

        hasCertificate:
          Boolean(certificate),

        certificateHeader:
          certificate
            ? "detected"
            : null,

        providerTimestamp,
      },

      payload:
        process.env
          .GPAY_WEBHOOK_CAPTURE_ENABLED ===
        "true"
          ? parsedBody
          : "[WEBHOOK_CAPTURE_DISABLED]",
    },
  });

  /*
   * Trong giai đoạn quan sát:
   * - chưa cập nhật order;
   * - chưa xác nhận thanh toán;
   * - chưa fulfillment.
   */
  const responseBody = {
    success: true,

    received: true,

    requestId:
      providerRequestId ??
      localRequestId,

    receivedAt,
  };

  await writeGPayDebugEvent({
    type: "webhook.response",

    requestId:
      providerRequestId ??
      localRequestId,

    operation:
      "gpay.webhook",

    data: {
      status: 200,
      body: responseBody,
    },
  });

  return NextResponse.json(
    responseBody,
    {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      service:
        "YSim GPay webhook",

      status: "ready",

      environment:
        process.env
          .GPAY_ENVIRONMENT ??
        "sandbox",

      timestamp:
        new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}
