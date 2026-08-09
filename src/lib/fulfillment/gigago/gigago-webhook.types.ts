export interface GigagoWebhookOrderDetail {
  qr_code?: string | null;
  msisdn?: string | null;
  iccid?: string | null;
  short_link?: string | null;
  code?: string | null;
  ggg_code?: string | null;
  description?: string | null;
  data?: string | null;
  validity?: string | null;
  apn?: string | null;
}

export interface GigagoWebhookResult {
  total_price?: number;
  order_detail?: string;
  website?: string;
}

export interface GigagoWebhookExtra {
  request_id: string;
  agency_order_id?: number;
  code?: string;
  notes?: string;
  status?: number;
  website?: string;
}

export interface GigagoWebhookEnvelope {
  code: number;
  message: string;
  totalRecords: number;
  result: GigagoWebhookResult[];
  extra: GigagoWebhookExtra;
}

export interface GigagoWebhookParsedPayload {
  envelope: GigagoWebhookEnvelope;
  callbackOrderDetails: GigagoWebhookOrderDetail[];
}

export interface GigagoPersistedEsim {
  providerDetailId: number;
  providerOrderId: string;
  planId: string;
  status: number;
  statusName: string;
  iccid: string | null;
  phoneNumber: string | null;
  qrCode: string | null;
  shortLink: string | null;
  data: string;
  validity: string;
  price: number;
}

export interface GigagoWebhookReconciliationResult {
  acknowledged: true;
  duplicate: boolean;
  reconciled: boolean;
  requestId: string;
  orderId: number;
  mode: "live" | "demo";
  providerOrderStatus: string;
  deliveredCount: number;
  expectedCount: number;
}
