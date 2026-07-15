import type { WooCommercePrice } from "@/lib/woocommerce/types";

export function formatWooCommercePrice(
  prices: WooCommercePrice,
): string {
  const numericPrice = Number(prices.price);

  if (!Number.isFinite(numericPrice)) {
    return "Liên hệ";
  }

  const minorUnit = prices.currency_minor_unit ?? 0;
  const actualPrice = numericPrice / Math.pow(10, minorUnit);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: prices.currency_code || "VND",
    maximumFractionDigits: minorUnit,
  }).format(actualPrice);
}


interface MoneyValue {
  amount: string;
  currencyCode: string;
  currencyMinorUnit: number;
}

export function formatMoney({
  amount,
  currencyCode,
  currencyMinorUnit,
}: MoneyValue): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Liên hệ";
  }

  const actualAmount =
    numericAmount / Math.pow(10, currencyMinorUnit);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currencyCode || "VND",
    maximumFractionDigits: currencyMinorUnit,
  }).format(actualAmount);
}