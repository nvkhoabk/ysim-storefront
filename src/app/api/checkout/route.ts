import { NextResponse } from "next/server";

import {
  getCartTokenCookie,
  setCartTokenCookie,
} from "@/lib/cart-cookie";
import { getWooCart } from "@/lib/woocommerce/cart-api";
import {
  getWooCheckout,
  processWooCheckout,
} from "@/lib/woocommerce/checkout-api";
import { checkoutFormSchema } from "@/features/checkout/checkout.validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        {
          message: "Không tìm thấy phiên giỏ hàng.",
        },
        {
          status: 400,
        },
      );
    }

    const [cartResult, checkoutResult] =
      await Promise.all([
        getWooCart(cartToken),
        getWooCheckout(cartToken),
      ]);

    const nextToken =
      checkoutResult.cartToken ??
      cartResult.cartToken;

    if (nextToken) {
      await setCartTokenCookie(nextToken);
    }

    return NextResponse.json(
      {
        cart: cartResult.data,
        checkout: checkoutResult.data,
        paymentMethods: [
          {
            id: "bacs",
            title: "Chuyển khoản ngân hàng",
            description:
              "Đơn hàng sẽ được xác nhận sau khi thanh toán được đối soát.",
          },
        ],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Cannot load checkout:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải trang thanh toán.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed =
      checkoutFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            "Thông tin thanh toán chưa hợp lệ.",
          issues: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        {
          message: "Không tìm thấy phiên giỏ hàng.",
        },
        {
          status: 400,
        },
      );
    }

    const cartResult = await getWooCart(cartToken);

    if (cartResult.data.items.length === 0) {
      return NextResponse.json(
        {
          message: "Giỏ hàng đang trống.",
        },
        {
          status: 400,
        },
      );
    }

    const values = parsed.data;

    const fullNameParts = values.fullName
      .trim()
      .split(/\s+/);

    const firstName =
      fullNameParts.shift() ?? values.fullName;

    const lastName = fullNameParts.join(" ");

    const billingAddress = {
      first_name: firstName,
      last_name: lastName,
      company: "",

      /*
       * WooCommerce có thể yêu cầu một số trường billing tùy
       * cấu hình quốc gia và plugin.
       */
      address_1: "Digital product",
      address_2: "",
      city: "Online",
      state: "",
      postcode: "000000",

      country: values.country,
      email: values.email,
      phone: values.phone,
    };

    const additionalFields: Record<string, unknown> = {};

    /*
     * Ta chưa gửi trường gift vào WooCommerce ở bước đầu,
     * vì custom field cần được đăng ký phía WordPress.
     * Trước mắt lưu trong customer_note.
     */
    const giftNote =
      values.purchaseFor === "gift"
        ? [
            "Mua tặng người khác",
            `Người nhận: ${values.recipientName}`,
            `Email người nhận: ${values.recipientEmail}`,
          ].join("\n")
        : "";

    const customerNote = [
      values.customerNote,
      giftNote,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await processWooCheckout(
      {
        billingAddress,
        paymentMethod: values.paymentMethod,
        customerNote,
        additionalFields,
        paymentData: [],
      },
      cartToken,
    );

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cannot process checkout:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo đơn hàng.",
      },
      {
        status: 500,
      },
    );
  }
}