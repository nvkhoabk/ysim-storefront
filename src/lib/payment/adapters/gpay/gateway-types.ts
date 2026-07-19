export type GPayGatewayPaymentType =
  | "IMMEDIATE"
  | string;

export type GPayGatewayPaymentMethod =
  | "BANK_ATM"
  | "BANK_INTERNATIONAL"
  | "QR PAYMENT"
  | string;

export interface GPayGatewayInitOrderInput {
  amount: number;
  callbackUrl: string;
  customerId: string;
  embedData: string;
  paymentType: GPayGatewayPaymentType;
  requestId: string;
  webhookUrl: string;

  address?: string;
  customerName?: string;
  description?: string;
  email?: string;
  paymentMethod?: GPayGatewayPaymentMethod;
  phone?: string;
  title?: string;
}

export interface GPayGatewayInitOrderRequest {
  address?: string;
  amount: number;
  callback_url: string;
  customer_id: string;
  customer_name?: string;
  description?: string;
  email?: string;
  embed_data: string;
  payment_method?: string;
  payment_type: string;
  phone?: string;
  request_id: string;
  title?: string;
  webhook_url: string;
}

export interface GPayGatewayApiError {
  error_code?: string;
  message?: string;
  path?: string;
  source_error?: string;
  url?: string;
}

export interface GPayGatewayMeta {
  code?: string | number;
  error?: GPayGatewayApiError | null;
  internal_msg?: string;
  msg?: string;
  message?: string;
}

export interface GPayGatewayInitOrderData {
  bill_id: string;
  bill_url: string;
  expired_time: string;
  request_id: string;
}

export interface GPayGatewayInitOrderResponse {
  meta?: GPayGatewayMeta;
  data?: Partial<GPayGatewayInitOrderData> | null;
}

export interface GPayGatewayInitOrderResult {
  provider: "gpay";
  billId: string;
  billUrl: string;
  expiredTime: string;
  requestId: string;
  tokenCached: boolean;
  securityRequestId: string;
  createdAt: string;
}

export interface GPayGatewayQueryOrderInput {
  gpayBillId: string;
  merchantOrderId: string;
}

export interface GPayGatewayQueryOrderRequest {
  gpay_bill_id: string;
  merchant_order_id: string;
}

export interface GPayGatewayQueryOrderData {
  embed_data?: string;
  gpay_bill_id?: string;
  gpay_trans_id?: string;
  merchant_order_id?: string;
  status?: string;
  user_payment_method?: string;
}

export interface GPayGatewayQueryOrderResponse {
  meta?: GPayGatewayMeta;
  data?: GPayGatewayQueryOrderData | null;
}

export interface GPayGatewayQueryOrderResult {
  provider: "gpay";
  gpayBillId: string;
  merchantOrderId: string;
  gpayTransactionId?: string;
  status?: string;
  userPaymentMethod?: string;
  embedData?: string;
  tokenCached: boolean;
  securityRequestId: string;
  queriedAt: string;
}
