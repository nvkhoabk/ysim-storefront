export interface GPayAccessToken {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  expiresAt: number;
  scope: string[];
}

export interface GPayTokenMetadata {
  tokenType: string;
  expiresInSeconds: number;
  expiresAt: string;
  scope: string[];
  tokenLength: number;
}

export type GPayTokenContentType =
  | "application/json"
  | "application/x-www-form-urlencoded";
