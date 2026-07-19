export interface GPayTokenRequest {
  client_id: string;
  client_secret: string;
}

export interface GPayApiMeta {
  code: string;
  message: string;
  error: unknown;
}

export interface GPayTokenData {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GPayTokenResponse {
  meta: GPayApiMeta;
  data: GPayTokenData;
}

export interface GPayAccessToken {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresInSeconds: number;
  obtainedAt: string;
  expiresAt: string;
}

export interface GPaySafeTokenInfo {
  tokenType: string;
  scope: string;
  obtainedAt: string;
  expiresAt: string;
  expiresInSeconds: number;
  cached: boolean;
}
