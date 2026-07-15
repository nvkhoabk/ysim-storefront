import Image from "next/image";
import {
  Clock3,
  Headphones,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { formatMoney } from "@/lib/currency";
import type { WooCommerceCart } from "@/lib/woocommerce/cart-types";

interface CheckoutOrderSummaryProps {
  cart: WooCommerceCart;
}

const benefits = [
  {
    icon: Mail,
    text: "Nhận QR qua email",
  },
  {
    icon: Clock3,
    text: "Xử lý nhanh sau thanh toán",
  },
  {
    icon: Headphones,
    text: "Hỗ trợ 24/7",
  },
  {
    icon: ShieldCheck,
    text: "Thanh toán bảo mật",
  },
];

export function CheckoutOrderSummary({
  cart,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold text-slate-950">
        Tóm tắt đơn hàng
      </h2>

      <div className="mt-5 space-y-5">
        {cart.items.map((item) => {
          const image = item.images?.[0];

          return (
            <article
              key={item.key}
              className="flex gap-4"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {image ? (
                  <Image
                    src={image.src}
                    alt={image.alt || item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                  {item.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Số lượng: {item.quantity}
                </p>

                <p className="mt-2 text-sm font-bold text-green-700">
                  {formatMoney({
                    amount: item.totals.line_total,
                    currencyCode:
                      item.totals.currency_code,
                    currencyMinorUnit:
                      item.totals.currency_minor_unit,
                  })}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Tạm tính</span>

          <span>
            {formatMoney({
              amount: cart.totals.total_items,
              currencyCode:
                cart.totals.currency_code,
              currencyMinorUnit:
                cart.totals.currency_minor_unit,
            })}
          </span>
        </div>

        {Number(cart.totals.total_discount) > 0 ? (
          <div className="flex justify-between text-green-700">
            <span>Giảm giá</span>

            <span>
              -
              {formatMoney({
                amount:
                  cart.totals.total_discount,
                currencyCode:
                  cart.totals.currency_code,
                currencyMinorUnit:
                  cart.totals.currency_minor_unit,
              })}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-950">
            Tổng cộng
          </span>

          <span className="text-xl font-bold text-green-700">
            {formatMoney({
              amount: cart.totals.total_price,
              currencyCode:
                cart.totals.currency_code,
              currencyMinorUnit:
                cart.totals.currency_minor_unit,
            })}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-1">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.text}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              <Icon className="h-4 w-4 shrink-0 text-green-700" />
              {benefit.text}
            </div>
          );
        })}
      </div>
    </aside>
  );
}