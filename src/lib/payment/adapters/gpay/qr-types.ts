import type {
  GPayQrTokenStrategy,
} from "./qr-config";

export interface GPayQrMeta {
  code: string;
  msg?: string;
  message?: string;
  internal_msg?: string;
  error?: unknown;
}

export interface GPayLegacyQrTokenResponse {
  meta?: GPayQrMeta;

  response?: {
    token?: string;
    expired_at?: string;
  };
}

export interface GPayQrAccessToken {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  obtainedAt: string;
  strategy: GPayQrTokenStrategy;
  scope?: string;
}

export interface GPayQrTokenResult {
  token: GPayQrAccessToken;
  cached: boolean;
}

export interface GPaySafeQrTokenInfo {
  tokenType: string;
  expiresAt: string;
  obtainedAt: string;
  strategy: GPayQrTokenStrategy;
  scope?: string;
  cached: boolean;
}

export type GPayQrType =
  | "STATIC"
  | "DYNAMIC";

export type GPayQrSourceOfFund =
  | "VIETQR"
  | "UNIONPAY";

export interface GPayCreateQrInput {
  billId: string;
  amount: number;
  description?: string;
  terminalId?: string;
  storeCode?: string;
  qrType?: GPayQrType;
  accountName?: string;
  sourceOfFund?: GPayQrSourceOfFund;
}

export interface GPayCreateQrRequest {
  merchant_code: string;
  terminal_id?: string;
  qr_type: GPayQrType;
  account_name: string;
  amount: number;

  tip?:
    | "01"
    | "02"
    | "03";

  value_fee_fix?: string;
  value_fee_rate?: string;

  source_of_fund:
    GPayQrSourceOfFund;

  bill_id: string;
  store_code?: string;
  description?: string;
  signature: string;
}

export interface GPayCreateQrResponseData {
  account_number: string;
  account_name: string;
  qr_code: string;
  qr_code_image: string;
  provider: string;
  signature: string;
}

export interface GPayCreateQrResponse {
  meta?: GPayQrMeta;
  response?: GPayCreateQrResponseData;
}

export interface GPayNormalizedQrPayment {
  provider: "gpay";
  billId: string;
  amount: number;
  currency: "VND";
  accountNumber: string;
  accountName: string;
  providerBank: string;
  qrPayload: string;
  qrImageDataUrl: string;
  responseVerified: true;
  createdAt: string;
}
