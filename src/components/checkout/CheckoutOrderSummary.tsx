import Image from "next/image";

import { Clock3, Headphones, Mail, ShieldCheck } from "lucide-react";

import { formatMoney } from "@/lib/currency";

import type {
  WooCommerceCart,
  WooCommerceCartItemVariation,
} from "@/lib/woocommerce/cart-types";
import { useTransactionTranslations } from "@/i18n/transaction/useTransactionTranslations";
import type { TransactionTranslator } from "@/i18n/transaction/transaction.types";

interface CheckoutOrderSummaryProps {
  cart: WooCommerceCart;
}

function normalizeAttributeKey(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/^attribute[_-]/, "")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getVariationLabel(
  attribute: string,
  t: TransactionTranslator,
): string {
  const normalized = normalizeAttributeKey(attribute);

  const labels: Record<string, string> = {
    "dung-luong": t("checkout.dataAmount"),

    "data-amount": t("checkout.dataAmount"),

    "data-unit": t("checkout.dataUnit"),

    "so-ngay": t("checkout.duration"),

    "duration-days": t("checkout.duration"),

    "data-type": t("checkout.dataType"),

    network: t("checkout.network"),
  };

  return (
    labels[normalized] ||
    attribute
      .replace(/^attribute[_-]/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function formatVariationValue(
  attribute: string,
  value: string,
  t: TransactionTranslator,
): string {
  const normalizedAttribute = normalizeAttributeKey(attribute);

  const trimmedValue = value.trim();

  if (
    normalizedAttribute === "so-ngay" ||
    normalizedAttribute === "duration-days"
  ) {
    return t("checkout.days", { count: trimmedValue });
  }

  if (normalizedAttribute === "dung-luong") {
    return trimmedValue.replace(/\s*\/\s*/g, "/").replace(/\/ngay/gi, "/ngày");
  }

  return trimmedValue;
}

function getDisplayVariations(
  variations: WooCommerceCartItemVariation[] | undefined,
): WooCommerceCartItemVariation[] {
  if (!variations) {
    return [];
  }

  return variations.filter(
    (variation) => variation.attribute.trim() && variation.value.trim(),
  );
}

export function CheckoutOrderSummary({ cart }: CheckoutOrderSummaryProps) {
  const t = useTransactionTranslations();
  const benefits = [
    { icon: Mail, text: t("checkout.benefitEmail") },
    { icon: Clock3, text: t("checkout.benefitFast") },
    { icon: Headphones, text: t("checkout.benefitSupport") },
    { icon: ShieldCheck, text: t("checkout.benefitSecure") },
  ];
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold text-slate-950">
        {t("checkout.summaryTitle")}
      </h2>

      <div className="mt-5 divide-y divide-slate-200">
        {cart.items.map((item) => {
          const image = item.images?.[0];

          const variations = getDisplayVariations(item.variation);

          return (
            <article key={item.key} className="py-5 first:pt-0 last:pb-0">
              <div className="flex gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
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
                  <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-slate-900">
                    {item.name}
                  </h3>

                  {item.sku ? (
                    <p className="mt-1 text-xs break-all text-slate-500">
                      SKU:{" "}
                      <span className="font-medium text-slate-700">
                        {item.sku}
                      </span>
                    </p>
                  ) : null}

                  <p className="mt-2 text-sm font-bold text-green-700">
                    {formatMoney({
                      amount: item.totals.line_total,

                      currencyCode: item.totals.currency_code,

                      currencyMinorUnit: item.totals.currency_minor_unit,
                    })}
                  </p>
                </div>
              </div>

              {variations.length > 0 ? (
                <dl className="mt-4 grid gap-2 rounded-xl bg-slate-50 px-4 py-3">
                  {variations.map((variation) => (
                    <div
                      key={`${item.key}:${variation.attribute}`}
                      className="flex items-start justify-between gap-4 text-xs"
                    >
                      <dt className="text-slate-500">
                        {getVariationLabel(variation.attribute, t)}
                      </dt>

                      <dd className="text-right font-semibold text-slate-800">
                        {formatVariationValue(
                          variation.attribute,
                          variation.value,
                          t,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t("common.quantity")}</span>

                <span className="font-semibold text-slate-800">
                  {item.quantity}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {t("checkout.unitPrice")}
                </span>

                <span className="font-semibold text-slate-800">
                  {formatMoney({
                    amount: item.prices.price,

                    currencyCode: item.prices.currency_code,

                    currencyMinorUnit: item.prices.currency_minor_unit,
                  })}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>{t("common.subtotal")}</span>

          <span>
            {formatMoney({
              amount: cart.totals.total_items,

              currencyCode: cart.totals.currency_code,

              currencyMinorUnit: cart.totals.currency_minor_unit,
            })}
          </span>
        </div>

        {Number(cart.totals.total_discount) > 0 ? (
          <div className="flex justify-between text-green-700">
            <span>{t("checkout.discount")}</span>

            <span>
              -
              {formatMoney({
                amount: cart.totals.total_discount,

                currencyCode: cart.totals.currency_code,

                currencyMinorUnit: cart.totals.currency_minor_unit,
              })}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-950">
            {t("common.total")}
          </span>

          <span className="text-xl font-bold text-green-700">
            {formatMoney({
              amount: cart.totals.total_price,

              currencyCode: cart.totals.currency_code,

              currencyMinorUnit: cart.totals.currency_minor_unit,
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
