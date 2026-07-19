import {
  buildGPayCreateQrUrl,
  getGPayQrConfig,
  type GPayQrTokenStrategy,
} from "./qr-config";
import { GPayError } from "./errors";
import {
  signGPayRawInput,
  verifyGPayProviderSignature,
} from "./crypto";
import { getGPayQrToken } from "./qr-token";
import {
  buildCreateQrSignatureInput,
  buildQrResponseSignatureInput,
} from "./qr-signature";
import type {
  GPayCreateQrInput,
  GPayCreateQrRequest,
  GPayCreateQrResponse,
  GPayCreateQrResponseData,
  GPayNormalizedQrPayment,
} from "./qr-types";
import { gpayFetch } from "./debug";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCreateQrResponseData(
  value: unknown,
): value is GPayCreateQrResponseData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.account_number === "string" &&
    typeof value.account_name === "string" &&
    typeof value.qr_code === "string" &&
    typeof value.qr_code_image === "string" &&
    typeof value.provider === "string" &&
    typeof value.signature === "string"
  );
}

function normalizeBase64Image(value: string): string {
  return value.startsWith("data:image/")
    ? value
    : `data:image/png;base64,${value}`;
}

export async function createGPayQrPayment(
  input: GPayCreateQrInput,
  options: {
    tokenStrategy?: GPayQrTokenStrategy;
    forceTokenRefresh?: boolean;
  } = {},
): Promise<GPayNormalizedQrPayment> {
  const config = getGPayQrConfig();

  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message:
        "Số tiền tạo QR phải là số nguyên lớn hơn 0.",
    });
  }

  const billId = input.billId.trim();

  if (!billId) {
    throw new GPayError({
      code: "GPAY_CONFIG_ERROR",
      message: "bill_id không được để trống.",
    });
  }

  const accountName =
    input.accountName?.trim() || config.accountName;
  const qrType = input.qrType ?? config.qrType;
  const sourceOfFund =
    input.sourceOfFund ?? config.sourceOfFund;

  const signatureInput = buildCreateQrSignatureInput({
    merchantCode: config.merchantCode,
    accountName,
    qrType,
    sourceOfFund,
    billId,
  });

  const requestBody: GPayCreateQrRequest = {
    merchant_code: config.merchantCode,
    qr_type: qrType,
    account_name: accountName,
    amount: input.amount,
    source_of_fund: sourceOfFund,
    bill_id: billId,
    signature: await signGPayRawInput(signatureInput),
  };

  const terminalId =
    input.terminalId?.trim() || config.terminalId;
  const storeCode =
    input.storeCode?.trim() || config.storeCode;

  if (terminalId) {
    requestBody.terminal_id = terminalId;
  }

  if (storeCode) {
    requestBody.store_code = storeCode;
  }

  if (input.description?.trim()) {
    requestBody.description = input.description.trim();
  }

  const tokenResult = await getGPayQrToken({
    forceRefresh: options.forceTokenRefresh,
    strategy: options.tokenStrategy,
  });

  const httpResult = await gpayFetch(
    buildGPayCreateQrUrl(config),
    {
      operation: "gpay.qr.payment.create",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          `${tokenResult.token.tokenType} ` +
          tokenResult.token.accessToken,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
      timeoutMs: config.requestTimeoutMs,
    },
  );

  if (!isRecord(httpResult.body)) {
    throw new GPayError({
      code: "GPAY_QR_RESPONSE_INVALID",
      status: httpResult.response.status,
      message: "GPay trả response tạo QR không hợp lệ.",
      details: httpResult.body,
    });
  }

  const payload =
    httpResult.body as unknown as GPayCreateQrResponse;

  if (
    !httpResult.response.ok ||
    !isCreateQrResponseData(payload.response)
  ) {
    throw new GPayError({
      code: "GPAY_QR_CREATE_REJECTED",
      status: httpResult.response.status,
      message:
        payload.meta?.msg ??
        payload.meta?.message ??
        "GPay từ chối yêu cầu tạo QR.",
      details: {
        meta: payload.meta,
        tokenStrategy: tokenResult.token.strategy,
      },
    });
  }

  const response = payload.response;
  const responseSignatureInput =
    buildQrResponseSignatureInput({
      qrCode: response.qr_code,
      accountNumber: response.account_number,
      accountName: response.account_name,
      provider: response.provider,
    });

  const responseVerified =
    await verifyGPayProviderSignature(
      responseSignatureInput,
      response.signature,
    );

  if (!responseVerified) {
    throw new GPayError({
      code: "GPAY_QR_SIGNATURE_INVALID",
      message:
        "Không xác minh được chữ ký response tạo QR của GPay.",
      details: {
        billId,
        tokenStrategy: tokenResult.token.strategy,
      },
    });
  }

  return {
    provider: "gpay",
    billId,
    amount: input.amount,
    currency: "VND",
    accountNumber: response.account_number,
    accountName: response.account_name,
    providerBank: response.provider,
    qrPayload: response.qr_code,
    qrImageDataUrl: normalizeBase64Image(
      response.qr_code_image,
    ),
    responseVerified: true,
    createdAt: new Date().toISOString(),
  };
}
