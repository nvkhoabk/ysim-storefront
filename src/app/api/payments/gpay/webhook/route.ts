import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: "ysim-gpay-webhook",
      environment: process.env.GPAY_ENV ?? "unknown",
      message: "GPay webhook endpoint is reachable.",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    /*
     * Phải đọc raw body trước khi JSON.parse.
     *
     * Sau này rawBody sẽ được dùng để xác minh chữ ký nếu
     * GPay ký trực tiếp trên request body.
     */
    const rawBody = await request.text();

    let payload: unknown = null;

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = rawBody;
      }
    }

    const webhookMetadata = {
      receivedAt: new Date().toISOString(),

      method: request.method,

      contentType: request.headers.get("content-type"),

      userAgent: request.headers.get("user-agent"),

      forwardedFor: request.headers.get("x-forwarded-for"),

      realIp: request.headers.get("x-real-ip"),

      /*
       * Chỉ ghi nhận tên header, chưa log giá trị chữ ký hoặc
       * token đầy đủ để tránh lộ dữ liệu xác thực.
       */
      hasSignature: Boolean(request.headers.get("signature")),

      hasCertificate: Boolean(request.headers.get("x-certificate")),

      requestId:
        request.headers.get("x-requests-id") ??
        request.headers.get("x-request-id"),

      timestamp: request.headers.get("x-timestamp"),

      payload,
    };

    console.info("GPay webhook received", webhookMetadata);

    /*
     * Giai đoạn này chỉ xác nhận endpoint đã nhận request.
     *
     * Chưa cập nhật trạng thái WooCommerce vì chưa thực hiện:
     * - xác minh chữ ký;
     * - đối chiếu merchant;
     * - đối chiếu order;
     * - đối chiếu số tiền;
     * - kiểm tra giao dịch trùng.
     */
    return NextResponse.json(
      {
        success: true,
        received: true,
        message: "Webhook received.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Cannot process GPay webhook:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cannot process webhook.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
