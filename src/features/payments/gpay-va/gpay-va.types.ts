export interface GPayVAMetaError {
  error_code?: string;
  message?: string;
  path?: string;
  source_error?: string;
  url?: string;
}

export interface GPayVAMeta {
  code?: string | number;
  message?: string;
  msg?: string;
  internal_msg?: string;
  error?: GPayVAMetaError | null;
}

export interface GPayVATokenResponse {
  meta?: GPayVAMeta;
  data?: {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
}

export interface GPayVirtualAccountData {
  account_name?: string;
  account_number?: string;
  account_type?: string;
  balance?: number;
  equal_amount?: number;
  expire_at?: string;
  max_amount?: number;
  min_amount?: number;
  qr_code?: string;
  qr_code_image?: string;
  start_at?: string;
  status?: string;
}

export interface GPayVAResponse {
  meta?: GPayVAMeta;
  data?: GPayVirtualAccountData;
}

export interface CreateGPayVAInput {
  account_name: string;
  account_type: "O";
  bank_code: string;
  description: string;
  equal_amount: number;
  map_id: string;
  map_type: "MHD";
}

export interface GPayVAWebhookPayload {
  gpay_trans_id: string;
  bank_trace_id?: string;
  bank_transaction_id?: string;
  account_number: string;
  amount: number;
  message?: string;
  merchant_code?: string;
  action: string;
  signature: string;
  sender_name?: string;
  sender_account?: string;
  sender_bank_bin?: string;
}
