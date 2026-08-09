// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1
// F07A_2D_1_NO_CURRENCY_CONVERSION
// F07A_2D_1_SOURCE_AMOUNTS_UNCHANGED
// F07A_2D_1_NO_SUBMISSION_OR_COMMERCE_MUTATION
// F07A_2D_1_NO_PAYMENT_OR_FULFILLMENT_CALLS

import { createLocalizedShellBundle } from "../shell/shell.config";
import { normalizeTransactionLocale } from "./transaction.registry";
import type {
  LocalizedTransactionBundle,
  TransactionView,
} from "./transaction.types";

const CART_ITEMS = [
  {
    sku: "JP-5GBD-7D",
    sourceTitle: "eSIM Nhật Bản – 5GB/ngày – 7 ngày",
    quantity: 1,
    sourceUnitPriceLabel: "169.000 ₫",
    sourceLineTotalLabel: "169.000 ₫",
  },
  {
    sku: "KR-3GBD-5D",
    sourceTitle: "eSIM Hàn Quốc – 3GB/ngày – 5 ngày",
    quantity: 1,
    sourceUnitPriceLabel: "169.000 ₫",
    sourceLineTotalLabel: "169.000 ₫",
  },
] as const;

const ORDER_FIXTURE = {
  orderCode: "YSIM-PREVIEW-2600",
  sourceCurrency: "VND" as const,
  sourceTotalLabel: "338.000 ₫",
  paymentProvider: "GPay" as const,
  paymentReference: "GPAY-PREVIEW-NO-TRANSACTION",
  deliveryChannel: "email",
};

const TRANSACTION_VIEWS = [
  "cart",
  "checkout",
  "payment",
  "order-result",
] as const satisfies readonly TransactionView[];

export function createLocalizedTransactionBundle(
  localeInput: unknown,
): LocalizedTransactionBundle {
  const locale = normalizeTransactionLocale(localeInput);
  const shell = createLocalizedShellBundle(locale);
  const preview = Object.fromEntries(
    TRANSACTION_VIEWS.map((view) => [
      view,
      `/ui-preview/localized-transaction?locale=${locale}&view=${view}`,
    ]),
  ) as Readonly<Record<TransactionView, string>>;

  return {
    locale,
    marketId: shell.marketId,
    currency: shell.currency,
    htmlLang: shell.htmlLang,
    direction: shell.direction,
    routes: { preview },
    cartItems: CART_ITEMS,
    sourceSubtotalLabel: "338.000 ₫",
    sourceTotalLabel: "338.000 ₫",
    sourceCurrency: "VND",
    order: ORDER_FIXTURE,
  };
}
