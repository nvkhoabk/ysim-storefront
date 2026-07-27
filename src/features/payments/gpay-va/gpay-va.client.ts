import { randomUUID } from "node:crypto";

import { getGPayVAConfig, joinGPayVAUrl } from "./gpay-va.config";
import {
  getGPayVACertificateBase64,
  signGPayVARequest,
} from "./gpay-va.crypto";
import type {
  CreateGPayVAInput,
  GPayVATokenResponse,
  GPayVAResponse,
  GPayVirtualAccountData,
} from "./gpay-va.types";

interface TokenCache {
  token: string;
  expiresAtMs: number;
}

let tokenCache: TokenCache | null = null;

function responseMessage(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const meta =
      record.meta && typeof record.meta === "object"
        ? (record.meta as Record<string, unknown>)
        : null;
    const error =
      meta?.error && typeof meta.error === "object"
        ? (meta.error as Record<string, unknown>)
        : null;

    const candidates = [
      error?.message,
      meta?.internal_msg,
      meta?.message,
      meta?.msg,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return `GPay VA trả HTTP ${status}.`;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `GPay VA trả dữ liệu không phải JSON (HTTP ${response.status}).`,
    );
  }
}

async function accessToken(): Promise<string> {
  const config = getGPayVAConfig();
  const now = Date.now();
  const refreshBufferMs = config.tokenRefreshBufferSeconds * 1000;

  if (tokenCache && tokenCache.expiresAtMs - refreshBufferMs > now) {
    return tokenCache.token;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(
      joinGPayVAUrl(config.baseUrl, config.tokenPath),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const body = (await parseJson(response)) as GPayVATokenResponse;

    if (!response.ok || !body.data?.access_token) {
      throw new Error(responseMessage(body, response.status));
    }

    const expiresIn =
      typeof body.data.expires_in === "number" && body.data.expires_in > 0
        ? body.data.expires_in
        : 300;

    tokenCache = {
      token: body.data.access_token,
      expiresAtMs: now + expiresIn * 1000,
    };

    return tokenCache.token;
  } finally {
    clearTimeout(timeout);
  }
}

async function signedPost<TResponse, TBody extends object>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const config = getGPayVAConfig();
  const token = await accessToken();
  const requestId = randomUUID();
  const timestamp = String(Date.now());
  const bodyText = JSON.stringify(body);
  const signature = await signGPayVARequest(
    `${timestamp}${requestId}${bodyText}`,
  );
  const certificate = await getGPayVACertificateBase64();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(joinGPayVAUrl(config.baseUrl, path), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        signature,
        "x-certificate": certificate,
        "x-requests-id": requestId,
        "x-timestamp": timestamp,
      },
      body: bodyText,
      cache: "no-store",
      signal: controller.signal,
    });
    const parsed = await parseJson(response);

    if (!response.ok) {
      throw new Error(responseMessage(parsed, response.status));
    }

    return parsed as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function requireVAData(response: GPayVAResponse): GPayVirtualAccountData {
  const code = String(response.meta?.code ?? "");

  if (code && code !== "200") {
    throw new Error(responseMessage(response, Number(code) || 500));
  }

  const data = response.data;

  if (
    !data?.account_number ||
    !data.account_name ||
    !data.account_type ||
    !data.status
  ) {
    throw new Error("GPay VA không trả đủ thông tin tài khoản ảo.");
  }

  return data;
}

export async function createGPayVirtualAccount(
  input: CreateGPayVAInput,
): Promise<GPayVirtualAccountData> {
  const config = getGPayVAConfig();
  const response = await signedPost<GPayVAResponse, CreateGPayVAInput>(
    config.createPath,
    input,
  );

  return requireVAData(response);
}

export async function getGPayVirtualAccountDetail(
  accountNumber: string,
): Promise<GPayVirtualAccountData> {
  const config = getGPayVAConfig();
  const response = await signedPost<GPayVAResponse, { account_number: string }>(
    config.detailPath,
    {
      account_number: accountNumber,
    },
  );

  return requireVAData(response);
}

export async function probeGPayVAConnectivity(): Promise<{
  tokenPresent: true;
  environment: string;
  baseUrl: string;
  tokenPath: string;
}> {
  const config = getGPayVAConfig();
  const token = await accessToken();

  if (!token) {
    throw new Error("GPay VA token không có giá trị.");
  }

  return {
    tokenPresent: true,
    environment: config.environment,
    baseUrl: config.baseUrl,
    tokenPath: config.tokenPath,
  };
}
