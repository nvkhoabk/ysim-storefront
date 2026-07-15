import {
  Check,
  Clock3,
  Headphones,
  Share2,
  ShieldCheck,
  Smartphone,
  Wifi,
} from "lucide-react";

import { formatWooCommercePrice } from "@/lib/currency";
import { stripHtml } from "@/lib/html";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

interface ProductSummaryProps {
  product: WooCommerceProduct;
}

const serviceBenefits = [
  {
    icon: Smartphone,
    text: "Không cần thay SIM vật lý",
  },
  {
    icon: Wifi,
    text: "Kết nối nhanh khi đến điểm đến",
  },
  {
    icon: Share2,
    text: "Hỗ trợ chia sẻ hotspot",
  },
  {
    icon: Headphones,
    text: "Hỗ trợ khách hàng 24/7",
  },
];

export function ProductSummary({
  product,
}: ProductSummaryProps) {
  const shortDescription = stripHtml(
    product.short_description || "",
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          eSIM du lịch
        </span>

        {product.on_sale ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            Đang ưu đãi
          </span>
        ) : null}

        {product.is_in_stock ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Còn hàng
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Tạm hết hàng
          </span>
        )}
      </div>

      <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
        {product.name}
      </h1>

      {product.sku ? (
        <p className="mt-3 text-sm text-slate-500">
          SKU: {product.sku}
        </p>
      ) : null}

      {shortDescription ? (
        <p className="mt-5 text-base leading-7 text-slate-600">
          {shortDescription}
        </p>
      ) : null}

      <div className="mt-6 border-y border-slate-200 py-6">
        <p className="text-sm text-slate-500">
          Giá sản phẩm
        </p>

        <p className="mt-1 text-3xl font-bold text-green-700">
          {formatWooCommercePrice(product.prices)}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Giá đã bao gồm các khoản phí được hiển thị tại thời điểm
          đặt hàng.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {serviceBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.text}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
            >
              <Icon className="h-5 w-5 shrink-0 text-green-700" />

              <span className="text-sm font-medium text-slate-700">
                {benefit.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-7 rounded-2xl border border-green-200 bg-green-50/60 p-5">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

          <div>
            <p className="font-semibold text-slate-900">
              Nhận eSIM nhanh chóng
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Mã QR eSIM sẽ được gửi sau khi đơn hàng được thanh
              toán và xử lý thành công.
            </p>
          </div>
        </div>
      </div>

      <AddToCartButton
		  productId={product.id}
		  disabled={
			!product.is_in_stock || !product.is_purchasable
		  }
		/>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-green-700" />
        Thanh toán an toàn và bảo mật
      </div>
    </div>
  );
}