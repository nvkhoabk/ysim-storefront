// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1

import type { ShellLocale } from "../shell/shell.types";

export type TransactionLocale = ShellLocale;
export type TransactionView = "cart" | "checkout" | "payment" | "order-result";
export type TransactionMessages = Readonly<Record<string, string>>;

export interface CartItemFixture {
  readonly sku: string;
  readonly sourceTitle: string;
  readonly quantity: number;
  readonly sourceUnitPriceLabel: string;
  readonly sourceLineTotalLabel: string;
}

export interface OrderResultFixture {
  readonly orderCode: string;
  readonly sourceCurrency: "VND";
  readonly sourceTotalLabel: string;
  readonly paymentProvider: "GPay";
  readonly paymentReference: string;
  readonly deliveryChannel: string;
}

export interface TransactionRoutes {
  readonly preview: Readonly<Record<TransactionView, string>>;
}

export interface LocalizedTransactionBundle {
  readonly locale: TransactionLocale;
  readonly marketId: string;
  readonly currency: "VND" | "USD" | "LAK";
  readonly htmlLang: string;
  readonly direction: "ltr" | "rtl";
  readonly routes: TransactionRoutes;
  readonly cartItems: readonly CartItemFixture[];
  readonly sourceSubtotalLabel: string;
  readonly sourceTotalLabel: string;
  readonly sourceCurrency: "VND";
  readonly order: OrderResultFixture;
}

export type TransactionTranslator = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;
