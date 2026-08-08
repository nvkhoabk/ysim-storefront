import { NextResponse } from "next/server";

import { checkoutFormSchema } from "@/features/checkout/checkout.validation";
import type { PaymentMethodOption } from "@/features/payments/payment.types";
import { getCartTokenCookie, setCartTokenCookie } from "@/lib/cart-cookie";
import { getWooCart } from "@/lib/woocommerce/cart-api";
import {
  getWooCheckout,
  processWooCheckout,
} from "@/lib/woocommerce/checkout-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentMethods: PaymentMethodOption[] = [
  {
    id: "gpay_gateway_all",
    title: "Thanh toán qua cổng GPay",
    description:
      "Chuyển sang cổng thanh toán GPay để chọn phương thức được hỗ trợ.",
  },
  {
    id: "gpay_virtual_account",
    title: "Chuyển khoản QR qua tài khoản ảo GPay",
    description:
      "YSim tạo tài khoản ảo dùng một lần và hiển thị VietQR ngay trên trang.",
  },
];

export async function GET() {
  try {
    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        { message: "Không tìm thấy phiên giỏ hàng." },
        { status: 400 },
      );
    }

    const [cartResult, checkoutResult] = await Promise.all([
      getWooCart(cartToken),
      getWooCheckout(cartToken),
    ]);

    const nextToken = checkoutResult.cartToken ?? cartResult.cartToken;

    if (nextToken) {
      await setCartTokenCookie(nextToken);
    }

    return NextResponse.json(
      {
        cart: cartResult.data,
        checkout: checkoutResult.data,
        paymentMethods,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
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
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = checkoutFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Thông tin thanh toán chưa hợp lệ.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        { message: "Không tìm thấy phiên giỏ hàng." },
        { status: 400 },
      );
    }

    const cartResult = await getWooCart(cartToken);
    const cart = cartResult.data;

    if (cart.items.length === 0) {
      return NextResponse.json(
        { message: "Giỏ hàng đang trống." },
        { status: 400 },
      );
    }

    if (!cart.needs_payment) {
      return NextResponse.json(
        { message: "Giỏ hàng hiện tại không yêu cầu thanh toán." },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const fullNameParts = values.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = fullNameParts.shift() ?? values.fullName;
    const lastName = fullNameParts.join(" ");

    const billingAddress = {
      first_name: firstName,
      last_name: lastName,
      company: "",
      address_1: "Digital product",
      address_2: "",
      city: "Online",
      state: "",
      postcode: "000000",
      country: values.country,
      email: values.email,
      phone: values.phone,
    };

    const giftNote =
      values.purchaseFor === "gift"
        ? [
            "Hình thức sử dụng: Mua tặng người khác",
            `Người nhận: ${values.recipientName}`,
            `Email người nhận: ${values.recipientEmail}`,
          ].join("\n")
        : "Hình thức sử dụng: Mua cho chính người đặt hàng";

    const paymentNote = `Phương thức thanh toán YSim: ${values.paymentMethod}`;

    const customerNote = [values.customerNote, giftNote, paymentNote]
      .filter(Boolean)
      .join("\n\n");

    const result = await processWooCheckout(
      {
        billingAddress,
        paymentMethod: values.paymentMethod,
        customerNote,
        additionalFields: {},
        paymentData: [],
      },
      cartToken,
    );

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(
      {
        checkout: result.data,
        selectedPaymentProvider: values.paymentMethod,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Cannot process checkout:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tạo đơn hàng.",
      },
      { status: 500 },
    );
  }
}
