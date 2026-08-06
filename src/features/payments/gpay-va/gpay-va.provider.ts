import { createHash } from "node:crypto";

import { enforceGigagoReadinessBeforePayment } from "@/lib/fulfillment/gigago/gigago-readiness-gate";
import {
  getWooCommerceAdminOrder,
  type WooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";
import {
  readWooCommerceOrderMetaString,
  updateWooCommerceAdminOrder,
  upsertWooCommerceOrderMeta,
} from "@/lib/woocommerce/order-admin-write-api";
import { claimWave1GPayVACanaryBudget } from "@/lib/runtime/wave1-gpay-va-budget";
import { assertWave1GPayVACanaryRequest } from "@/lib/runtime/wave1-gpay-va-canary";

import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentSession,
} from "../payment.types";
import {
  createGPayVirtualAccount,
  getGPayVirtualAccountDetail,
} from "./gpay-va.client";
import { getGPayVAConfig } from "./gpay-va.config";
import type { GPayVirtualAccountData } from "./gpay-va.types";

const META = {
  provider: "_ysim_payment_provider",
  paymentStatus: "_ysim_payment_status",
  merchantTransactionId: "_ysim_merchant_transaction_id",
  createState: "_ysim_gpay_va_create_state",
  accountNumber: "_ysim_gpay_va_account_number",
  accountName: "_ysim_gpay_va_account_name",
  accountType: "_ysim_gpay_va_account_type",
  bankCode: "_ysim_gpay_va_bank_code",
  mapId: "_ysim_gpay_va_map_id",
  equalAmount: "_ysim_gpay_va_equal_amount",
  status: "_ysim_gpay_va_status",
  expireAt: "_ysim_gpay_va_expire_at",
  createdAt: "_ysim_gpay_va_created_at",
  remark: "_ysim_gpay_va_remark",
} as const;

const inFlight = new Map<number, Promise<PaymentSession>>();

function numberMeta(order: WooCommerceAdminOrder, key: string): number | null {
  const value = readWooCommerceOrderMetaString(order, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : null;
}

function createStableReference(input: CreatePaymentInput): string {
  const suffix = createHash("sha256")
    .update(`${input.orderId}:${input.orderKey}`, "utf8")
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `YSIM-${input.orderId}-${suffix}`;
}

function qrImage(value?: string): string | undefined {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith("data:image/")) {
    return normalized;
  }

  return `data:image/png;base64,${normalized}`;
}

function sessionFromData(
  input: CreatePaymentInput,
  data: GPayVirtualAccountData,
  reference: string,
  bankCode: string,
): PaymentSession {
  return {
    provider: "gpay_virtual_account",
    status: "waiting",
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    merchantTransactionId: reference,
    amount: input.amount,
    currency: input.currency.toUpperCase(),
    expiresAt: data.expire_at || undefined,
    message: "Quét VietQR hoặc chuyển khoản đúng thông tin để thanh toán.",
    qr: {
      image: qrImage(data.qr_code_image),
      content: data.qr_code || undefined,
      accountNumber: data.account_number,
      accountName: data.account_name,
      provider: bankCode,
      bankCode,
      remark: reference,
      status: data.status,
    },
  };
}

async function reuseExisting(
  order: WooCommerceAdminOrder,
  input: CreatePaymentInput,
): Promise<PaymentSession | null> {
  const accountNumber = readWooCommerceOrderMetaString(
    order,
    META.accountNumber,
  );
  const reference = readWooCommerceOrderMetaString(order, META.mapId);
  const bankCode =
    readWooCommerceOrderMetaString(order, META.bankCode) || "BIDV";
  const equalAmount = numberMeta(order, META.equalAmount);
  const status = readWooCommerceOrderMetaString(order, META.status);

  if (
    !accountNumber ||
    !reference ||
    equalAmount !== input.amount ||
    status?.toUpperCase() !== "OPEN"
  ) {
    return null;
  }

  const detail = await getGPayVirtualAccountDetail(accountNumber);

  return sessionFromData(input, detail, reference, bankCode);
}

async function createSession(
  input: CreatePaymentInput,
): Promise<PaymentSession> {
  const currency = input.currency.toUpperCase();

  if (currency !== "VND") {
    throw new Error("GPay Virtual Account chỉ hỗ trợ VND.");
  }

  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error("Số tiền VA phải là số nguyên VND lớn hơn 0.");
  }

  const canaryPolicy = assertWave1GPayVACanaryRequest({
    provider: "gpay_virtual_account",
    orderId: input.orderId,
    amountVnd: input.amount,
    nodeEnvironment: process.env.NODE_ENV,
  });

  if (
    !canaryPolicy &&
    process.env.GPAY_COMMERCE_AUTOMATION_MODE?.trim().toLowerCase() ===
      "fulfill"
  ) {
    await enforceGigagoReadinessBeforePayment({
      orderId: input.orderId,
      paymentProvider: "gpay_virtual_account",
    });
  }

  const config = getGPayVAConfig();
  const order = await getWooCommerceAdminOrder(input.orderId);
  const existing = await reuseExisting(order, input);

  if (existing) {
    return existing;
  }

  const createState = readWooCommerceOrderMetaString(order, META.createState);
  const existingAccount = readWooCommerceOrderMetaString(
    order,
    META.accountNumber,
  );

  if (
    !existingAccount &&
    (createState === "creating" || createState === "uncertain")
  ) {
    throw new Error(
      "Trạng thái tạo Virtual Account chưa xác định. Không tự tạo lại để tránh phát sinh hai VA; cần operator kiểm tra GPay.",
    );
  }

  await claimWave1GPayVACanaryBudget(canaryPolicy);

  const reference = createStableReference(input);
  const preparedMeta = upsertWooCommerceOrderMeta(order, {
    [META.provider]: "gpay_virtual_account",
    [META.paymentStatus]: "PENDING",
    [META.merchantTransactionId]: reference,
    [META.createState]: "creating",
    [META.mapId]: reference,
    [META.equalAmount]: input.amount,
    [META.bankCode]: config.bankCode,
    [META.remark]: reference,
  });

  await updateWooCommerceAdminOrder(order.id, {
    payment_method: "gpay_virtual_account",
    payment_method_title: "GPay Virtual Account",
    meta_data: preparedMeta,
  });

  let data: GPayVirtualAccountData;

  try {
    data = await createGPayVirtualAccount({
      account_name: config.accountName,
      account_type: "O",
      bank_code: config.bankCode,
      description: reference,
      equal_amount: input.amount,
      map_id: reference,
      map_type: "MHD",
    });
  } catch (error) {
    const refreshed = await getWooCommerceAdminOrder(order.id);
    const failedMeta = upsertWooCommerceOrderMeta(refreshed, {
      [META.createState]: "uncertain",
    });

    await updateWooCommerceAdminOrder(order.id, {
      meta_data: failedMeta,
    });

    throw new Error(
      error instanceof Error
        ? `Không thể tạo tài khoản ảo GPay: ${error.message}`
        : "Không thể tạo tài khoản ảo GPay.",
    );
  }

  const refreshed = await getWooCommerceAdminOrder(order.id);
  const createdMeta = upsertWooCommerceOrderMeta(refreshed, {
    [META.createState]: "created",
    [META.accountNumber]: data.account_number || "",
    [META.accountName]: data.account_name || "",
    [META.accountType]: data.account_type || "O",
    [META.status]: data.status || "OPEN",
    [META.expireAt]: data.expire_at || "",
    [META.createdAt]: new Date().toISOString(),
  });

  await updateWooCommerceAdminOrder(order.id, {
    payment_method: "gpay_virtual_account",
    payment_method_title: "GPay Virtual Account",
    meta_data: createdMeta,
  });

  return sessionFromData(input, data, reference, config.bankCode);
}

export const gpayVirtualAccountProvider: PaymentProvider = {
  id: "gpay_virtual_account",

  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    const existing = inFlight.get(input.orderId);

    if (existing) {
      return existing;
    }

    const task = createSession(input).finally(() => {
      inFlight.delete(input.orderId);
    });

    inFlight.set(input.orderId, task);

    return task;
  },
};
