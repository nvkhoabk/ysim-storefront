import { NextResponse } from "next/server";

import { checkoutFormSchema } from "@/features/checkout/checkout.validation";
import { getCartTokenCookie, setCartTokenCookie } from "@/lib/cart-cookie";
import { getWooCart } from "@/lib/woocommerce/cart-api";
import {
  getWooCheckout,
  processWooCheckout,
} from "@/lib/woocommerce/checkout-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Các phương thức thanh toán mà giao diện YSim hỗ trợ.
 *
 * Đây là ID nội bộ của Payment Orchestrator, không nhất thiết
 * phải trùng với ID gateway đã đăng ký trong WooCommerce.
 */
const paymentMethods = [
  {
    id: "gpay_qr",
    title: "Chuyển khoản ngân hàng bằng mã QR",
    description:
      "Quét QR bằng ứng dụng ngân hàng. GPay tự động xác nhận khi nhận được tiền.",
  },
  {
    id: "onepay_card",
    title: "Thẻ tín dụng hoặc thẻ quốc tế",
    description: "Thanh toán bảo mật qua cổng OnePay.",
  },
  {
    id: "cash_agent",
    title: "Thanh toán tiền mặt",
    description:
      "Thanh toán trực tiếp cho nhân viên hoặc đại lý YSim. Đơn chỉ được xử lý sau khi nhân viên xác nhận.",
  },
] as const;

/**
 * Trong giai đoạn Payment Orchestrator chưa được đăng ký dưới dạng
 * WooCommerce payment gateway, ta dùng một gateway WooCommerce đang
 * hoạt động để WooCommerce tạo đơn pending.
 *
 * Sau đó adapter GPay/OnePay/Cash sẽ xử lý thanh toán riêng.
 *
 * Yêu cầu:
 * WooCommerce → Settings → Payments → Direct bank transfer phải bật.
 */
const WOO_ORDER_CREATION_GATEWAY = "bacs";

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
    const body: unknown = await request.json();

    const parsed = checkoutFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Thông tin thanh toán chưa hợp lệ.",
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

    /*
     * Luôn kiểm tra cart trên server trước khi tạo order.
     * Không tin dữ liệu sản phẩm và số tiền gửi từ trình duyệt.
     */
    const cartResult = await getWooCart(cartToken);
    const cart = cartResult.data;

    if (cart.items.length === 0) {
      return NextResponse.json(
        {
          message: "Giỏ hàng đang trống.",
        },
        {
          status: 400,
        },
      );
    }

    if (!cart.needs_payment) {
      return NextResponse.json(
        {
          message: "Giỏ hàng hiện tại không yêu cầu thanh toán.",
        },
        {
          status: 400,
        },
      );
    }

    const values = parsed.data;

    const fullNameParts = values.fullName.trim().split(/\s+/).filter(Boolean);

    /*
     * Với tên Việt Nam, cách tách first_name/last_name chỉ mang
     * tính tương thích với WooCommerce.
     *
     * fullName vẫn là dữ liệu gốc được frontend gửi lên.
     */
    const firstName = fullNameParts.shift() ?? values.fullName;

    const lastName = fullNameParts.join(" ");

    const billingAddress = {
      first_name: firstName,
      last_name: lastName,
      company: "",

      /*
       * YSim bán sản phẩm số. Các trường dưới đây được điền
       * tối thiểu để tương thích với WooCommerce.
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

    const giftNote =
      values.purchaseFor === "gift"
        ? [
            "Hình thức sử dụng: Mua tặng người khác",
            `Người nhận: ${values.recipientName}`,
            `Email người nhận: ${values.recipientEmail}`,
          ].join("\n")
        : "Hình thức sử dụng: Mua cho chính người đặt hàng";

    /*
     * Lưu phương thức thanh toán YSim vào order note trong
     * giai đoạn chưa có WooCommerce custom fields/plugin riêng.
     */
    const paymentNote = [
      "Phương thức thanh toán YSim:",
      values.paymentMethod,
    ].join(" ");

    const customerNote = [values.customerNote, giftNote, paymentNote]
      .filter(Boolean)
      .join("\n\n");

    const additionalFields: Record<string, unknown> = {};

    /*
     * Quan trọng:
     *
     * Không truyền:
     * paymentMethod: z.enum(...)
     *
     * z.enum chỉ dùng trong schema validation, không phải giá trị
     * gửi đến WooCommerce.
     *
     * Tạm thời dùng bacs để WooCommerce tạo order pending.
     * Payment Orchestrator sẽ xử lý GPay, OnePay hoặc Cash sau đó.
     */
    const result = await processWooCheckout(
      {
        billingAddress,
        paymentMethod: WOO_ORDER_CREATION_GATEWAY,
        customerNote,
        additionalFields,
        paymentData: [],
      },
      cartToken,
    );

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    /*
     * Trả thêm selectedPaymentProvider để client biết cần gọi
     * adapter thanh toán nào sau khi order được tạo.
     *
     * Không cần thay đổi interface WooCommerceCheckout vì đây
     * là response mở rộng riêng của YSim.
     */
    return NextResponse.json(
      {
        checkout: result.data,
        selectedPaymentProvider: values.paymentMethod,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Cannot process checkout:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tạo đơn hàng.",
      },
      {
        status: 500,
      },
    );
  }
}
