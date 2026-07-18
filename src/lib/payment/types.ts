export type PaymentProviderId =
  | "gpay"
  | "onepay"
  | "manual";

export type PaymentStatus =
  | "created"
  | "pending"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

export type PaymentActionType =
  | "none"
  | "redirect"
  | "qr_code"
  | "manual_instruction";

export interface PaymentMoney {
  amount: number;

  currency: string;
}

export interface PaymentCustomer {
  email: string;

  firstName?: string;

  lastName?: string;

  phone?: string;
}

export interface PaymentOrderReference {
  /**
   * WooCommerce order ID.
   */
  orderId: number;

  /**
   * WooCommerce order key, nếu có.
   */
  orderKey?: string;

  /**
   * Mã đơn hàng hiển thị cho khách hàng.
   */
  orderNumber?: string;
}

export interface PaymentMetadata {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined;
}

export interface CreatePaymentInput {
  providerId: PaymentProviderId;

  order: PaymentOrderReference;

  money: PaymentMoney;

  customer: PaymentCustomer;

  description: string;

  /**
   * URL khách được đưa về storefront sau thanh toán.
   */
  returnUrl?: string;

  /**
   * URL provider gọi webhook.
   */
  webhookUrl?: string;

  metadata?: PaymentMetadata;
}

export interface PaymentQrCodeAction {
  type: "qr_code";

  /**
   * URL ảnh QR do provider trả về.
   */
  imageUrl?: string;

  /**
   * Nội dung QR dạng chuỗi để frontend tự render.
   */
  payload?: string;

  /**
   * Nội dung chuyển khoản.
   */
  transferContent?: string;

  /**
   * Thông tin tài khoản nhận tiền.
   */
  accountName?: string;

  accountNumber?: string;

  bankName?: string;
}

export interface PaymentRedirectAction {
  type: "redirect";

  url: string;

  method?: "GET" | "POST";
}

export interface PaymentManualAction {
  type: "manual_instruction";

  title: string;

  instructions: string[];

  expiresAt?: string;
}

export interface PaymentNoAction {
  type: "none";
}

export type PaymentAction =
  | PaymentQrCodeAction
  | PaymentRedirectAction
  | PaymentManualAction
  | PaymentNoAction;

export interface CreatePaymentResult {
  providerId: PaymentProviderId;

  /**
   * ID giao dịch trong hệ thống provider.
   */
  providerPaymentId: string;

  /**
   * ID nội bộ dùng cho logging/tracing nếu cần.
   */
  paymentReference: string;

  status: PaymentStatus;

  action: PaymentAction;

  createdAt: string;

  expiresAt?: string;

  raw?: unknown;
}

export interface GetPaymentStatusInput {
  providerPaymentId: string;

  orderId?: number;
}

export interface PaymentStatusResult {
  providerId: PaymentProviderId;

  providerPaymentId: string;

  status: PaymentStatus;

  paidAt?: string;

  failureCode?: string;

  failureMessage?: string;

  raw?: unknown;
}

export interface VerifyWebhookInput {
  headers: Headers;

  rawBody: string;
}

export interface PaymentWebhookEvent {
  providerId: PaymentProviderId;

  eventId: string;

  eventType: string;

  providerPaymentId?: string;

  orderId?: number;

  status?: PaymentStatus;

  paidAt?: string;

  amount?: number;

  currency?: string;

  raw: unknown;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;

  readonly displayName: string;

  readonly enabled: boolean;

  createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult>;

  getPaymentStatus?(
    input: GetPaymentStatusInput,
  ): Promise<PaymentStatusResult>;

  verifyWebhook?(
    input: VerifyWebhookInput,
  ): Promise<PaymentWebhookEvent>;
}