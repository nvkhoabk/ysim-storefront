import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint GET chỉ dùng để kiểm tra khả năng truy cập webhook.
 * GPay thực tế sẽ gửi callback bằng POST.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: "ysim-gpay-webhook",
      environment:
        process.env.GPAY_ENV ?? "unknown",
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

/**
 * Webhook Sandbox ban đầu.
 *
 * Chưa cập nhật trạng thái WooCommerce order ở phiên bản này.
 * Ngày mai ta sẽ bổ sung:
 *
 * 1. Đọc raw request body.
 * 2. Xác minh chữ ký GPay.
 * 3. Đối chiếu request_id/bill_id/order.
 * 4. Đối chiếu số tiền và merchant.
 * 5. Chống xử lý callback lặp lại.
 * 6. Cập nhật WooCommerce order.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    let payload: unknown = rawBody;

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = rawBody;
      }
    }

    /*
     * Chỉ log metadata cơ bản trong Sandbox.
     * Không log Authorization, secret hoặc private key.
     */
    console.info("GPay webhook received", {
      receivedAt: new Date().toISOString(),
      contentType:
        request.headers.get("content-type"),
      userAgent:
        request.headers.get("user-agent"),
      payload,
    });

    /*
     * Tạm trả HTTP 200 để xác nhận hệ thống đã nhận request.
     * Không coi đây là giao dịch hợp lệ cho tới khi chữ ký
     * và dữ liệu được xác minh đầy đủ.
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
    console.error(
      "Cannot process GPay webhook:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Cannot process webhook.",
      },
      {
        status: 500,
      },
    );
  }
}