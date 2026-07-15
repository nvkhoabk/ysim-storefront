export interface GPayMeta {
  code: string;
  msg: string;
  internal_msg?: string;
}

export interface GPayTokenPayload {
  token: string;
  expired_at?: string;
}

export interface GPayTokenResponse {
  meta: GPayMeta;
  response: GPayTokenPayload;
}

export interface GPayCreateQrInput {
  billId: string;
  amount: number;
  description: string;
}

export interface GPayQrData {
  account_number: string;
  account_name: string;
  qr_code: string;
  qr_code_image: string;
  provider: string;
  signature?: string;
}

export interface GPayCreateQrResponse {
  meta: GPayMeta;
  response: GPayQrData;
}
