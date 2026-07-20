"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

interface PendingGPayPayment {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  provider: string;
  gpayBillId: string;
  merchantOrderId: string;
  billUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

interface QueryResponse {
  success: boolean;
  message?: string;

  payment?: {
    status?: string;
    gpayTransactionId?: string;
    userPaymentMethod?: string;
    queriedAt?: string;
  };
}

interface VerifyCallbackResponse {
  success: boolean;
  verified: boolean;

  verificationStrategy?:
    | string
    | null;

  normalizedStatus?:
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "EXPIRED"
    | "PENDING";

  message?: string;

  callback?: {
    embedData?: string;
    gpayBillId?: string;
    gpayTransactionId?: string;
    merchantOrderId?: string;
    status?: string;
    userPaymentMethod?: string;
  };

  parsedEmbedData?: {
    orderId?: unknown;
    orderNumber?: unknown;
    orderKey?: unknown;
    paymentProvider?: unknown;
    merchantOrderId?: unknown;
  } | null;
}

const STORAGE_KEY =
  "ysim:gpay:pending-payment";

const SUCCESS_STATUSES =
  new Set([
    "ORDER_SUCCESS",
    "SUCCESS",
    "PAID",
  ]);

const FAILED_STATUSES =
  new Set([
    "ORDER_FAILED",
    "FAILED",
  ]);

const CANCELLED_STATUSES =
  new Set([
    "ORDER_CANCELLED",
    "ORDER_CANCELED",
    "CANCELLED",
    "CANCELED",
  ]);

const EXPIRED_STATUSES =
  new Set([
    "ORDER_EXPIRED",
    "EXPIRED",
  ]);

function normalizeStatus(
  value: string | undefined,
): string {
  return (
    value
      ?.trim()
      .toUpperCase() ||
    "PENDING"
  );
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function createPendingFromCallback(
  verification:
    VerifyCallbackResponse,
): PendingGPayPayment | null {
  if (
    !verification.verified ||
    !verification.callback ||
    !verification
      .parsedEmbedData
  ) {
    return null;
  }

  const embed =
    verification
      .parsedEmbedData;

  const orderId =
    isPositiveInteger(
      embed.orderId,
    )
      ? embed.orderId
      : null;

  const orderNumber =
    typeof embed.orderNumber ===
      "string"
      ? embed.orderNumber
      : orderId
        ? String(orderId)
        : "";

  const orderKey =
    typeof embed.orderKey ===
      "string"
      ? embed.orderKey
      : "";

  const provider =
    typeof embed
      .paymentProvider ===
      "string"
      ? embed
          .paymentProvider
      : "gpay_gateway_all";

  const gpayBillId =
    verification.callback
      .gpayBillId
      ?.trim() ?? "";

  const merchantOrderId =
    verification.callback
      .merchantOrderId
      ?.trim() ||
    (
      typeof embed
        .merchantOrderId ===
        "string"
        ? embed
            .merchantOrderId
        : ""
    );

  if (
    !orderId ||
    !orderNumber ||
    !gpayBillId ||
    !merchantOrderId
  ) {
    return null;
  }

  return {
    orderId,
    orderNumber,
    orderKey,
    provider,
    gpayBillId,
    merchantOrderId,

    createdAt:
      new Date()
        .toISOString(),
  };
}

export function GPayReturnClient() {
  const [
    pending,
    setPending,
  ] =
    useState<PendingGPayPayment | null>(
      null,
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "CHECKING",
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      "Đang xác minh kết quả trả về từ GPay...",
    );

  const [
    transactionId,
    setTransactionId,
  ] =
    useState<string | undefined>();

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<string | undefined>();

  const [
    isQuerying,
    setIsQuerying,
  ] =
    useState(false);

  const [
    callbackVerified,
    setCallbackVerified,
  ] =
    useState<boolean | null>(
      null,
    );

  const [
    verificationNote,
    setVerificationNote,
  ] =
    useState<string | null>(
      null,
    );

  const isSuccess =
    SUCCESS_STATUSES.has(
      status,
    );

  const isFailed =
    FAILED_STATUSES.has(
      status,
    );

  const isCancelled =
    CANCELLED_STATUSES.has(
      status,
    );

  const isExpired =
    EXPIRED_STATUSES.has(
      status,
    );

  const isTerminal =
    isSuccess ||
    isFailed ||
    isCancelled ||
    isExpired;

  const statusTitle =
    useMemo(() => {
      if (isSuccess) {
        return "Thanh toán thành công";
      }

      if (isFailed) {
        return "Giao dịch không thành công";
      }

      if (isCancelled) {
        return "Giao dịch đã bị hủy";
      }

      if (isExpired) {
        return "Phiên thanh toán đã hết hạn";
      }

      if (
        status ===
        "MISSING_SESSION"
      ) {
        return "Không tìm thấy phiên thanh toán";
      }

      if (
        status ===
        "UNVERIFIED_CALLBACK"
      ) {
        return "Chưa xác minh được kết quả GPay";
      }

      return "Đang chờ GPay xác nhận";
    }, [
      isCancelled,
      isExpired,
      isFailed,
      isSuccess,
      status,
    ]);

  async function queryPayment(
    current:
      PendingGPayPayment,
  ) {
    setIsQuerying(true);

    try {
      const response =
        await fetch(
          "/api/payments/gpay/query-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                gpayBillId:
                  current
                    .gpayBillId,

                merchantOrderId:
                  current
                    .merchantOrderId,

                orderId:
                  current.orderId,

                orderKey:
                  current
                    .orderKey ||
                  "callback-verified",
              }),
          },
        );

      const data =
        (await response.json()) as
          QueryResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.payment
      ) {
        throw new Error(
          data.message ||
          "Không thể truy vấn GPay.",
        );
      }

      const nextStatus =
        normalizeStatus(
          data.payment.status,
        );

      setStatus(
        nextStatus,
      );

      setTransactionId(
        data.payment
          .gpayTransactionId,
      );

      setPaymentMethod(
        data.payment
          .userPaymentMethod,
      );

      if (
        SUCCESS_STATUSES.has(
          nextStatus,
        )
      ) {
        setMessage(
          "GPay đã xác nhận giao dịch thành công.",
        );

        sessionStorage.removeItem(
          STORAGE_KEY,
        );

        return;
      }

      if (
        FAILED_STATUSES.has(
          nextStatus,
        )
      ) {
        setMessage(
          "GPay đã xác nhận giao dịch không thành công.",
        );

        return;
      }

      if (
        CANCELLED_STATUSES.has(
          nextStatus,
        )
      ) {
        setMessage(
          "Giao dịch đã bị hủy.",
        );

        return;
      }

      if (
        EXPIRED_STATUSES.has(
          nextStatus,
        )
      ) {
        setMessage(
          "Phiên thanh toán đã hết hạn.",
        );

        return;
      }

      setMessage(
        "GPay đã nhận diện đơn hàng nhưng chưa có giao dịch thành công. Bạn có thể kiểm tra lại hoặc quay lại trang thanh toán.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra trạng thái thanh toán.",
      );
    } finally {
      setIsQuerying(false);
    }
  }

  async function verifyCallback(
    queryString: string,
  ): Promise<VerifyCallbackResponse> {
    const response =
      await fetch(
        "/api/payments/gpay/verify-callback",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          cache:
            "no-store",

          body:
            JSON.stringify({
              queryString,
            }),
        },
      );

    const data =
      (await response.json()) as
        VerifyCallbackResponse;

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Không thể xác minh callback GPay.",
      );
    }

    return data;
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const rawSession =
        sessionStorage.getItem(
          STORAGE_KEY,
        );

      let storedPending:
        | PendingGPayPayment
        | null = null;

      if (rawSession) {
        try {
          storedPending =
            JSON.parse(
              rawSession,
            ) as
              PendingGPayPayment;
        } catch {
          storedPending = null;
        }
      }

      const queryString =
        window.location.search;

      if (queryString) {
        try {
          const verification =
            await verifyCallback(
              queryString,
            );

          if (cancelled) {
            return;
          }

          setCallbackVerified(
            verification
              .verified,
          );

          setVerificationNote(
            verification.verified
              ? verification
                  .verificationStrategy ||
                "verified"
              : "Chữ ký callback không khớp với các định dạng đang hỗ trợ.",
          );

          const callbackPending =
            createPendingFromCallback(
              verification,
            );

          const currentPending =
            storedPending ??
            callbackPending;

          if (currentPending) {
            setPending(
              currentPending,
            );
          }

          const callback =
            verification.callback;

          setTransactionId(
            callback
              ?.gpayTransactionId ||
            undefined,
          );

          setPaymentMethod(
            callback
              ?.userPaymentMethod ||
            undefined,
          );

          const rawCallbackStatus =
            normalizeStatus(
              callback?.status,
            );

          if (
            verification.verified &&
            verification
              .normalizedStatus !==
              "PENDING"
          ) {
            setStatus(
              rawCallbackStatus,
            );

            if (
              verification
                .normalizedStatus ===
              "SUCCESS"
            ) {
              setMessage(
                "GPay đã xác nhận giao dịch thành công.",
              );

              sessionStorage.removeItem(
                STORAGE_KEY,
              );
            } else if (
              verification
                .normalizedStatus ===
              "FAILED"
            ) {
              setMessage(
                "GPay đã xác nhận giao dịch không thành công. Bạn có thể thử thanh toán lại.",
              );
            } else if (
              verification
                .normalizedStatus ===
              "CANCELLED"
            ) {
              setMessage(
                "Giao dịch đã bị hủy. Bạn có thể quay lại Checkout để thử lại.",
              );
            } else {
              setMessage(
                "Phiên thanh toán đã hết hạn. Vui lòng tạo lại giao dịch.",
              );
            }

            return;
          }

          if (
            !verification.verified
          ) {
            if (currentPending) {
              setStatus(
                "CHECKING",
              );

              setMessage(
                "Chưa xác minh được chữ ký callback. Hệ thống đang truy vấn trực tiếp GPay để đối soát.",
              );

              await queryPayment(
                currentPending,
              );

              return;
            }

            setStatus(
              "UNVERIFIED_CALLBACK",
            );

            setMessage(
              "Không thể xác minh chữ ký callback và trình duyệt không còn dữ liệu phiên thanh toán.",
            );

            return;
          }

          if (currentPending) {
            await queryPayment(
              currentPending,
            );

            return;
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          setCallbackVerified(
            false,
          );

          setVerificationNote(
            error instanceof Error
              ? error.message
              : "Không thể xác minh callback.",
          );

          if (storedPending) {
            setPending(
              storedPending,
            );

            await queryPayment(
              storedPending,
            );

            return;
          }
        }
      }

      if (storedPending) {
        setPending(
          storedPending,
        );

        await queryPayment(
          storedPending,
        );

        return;
      }

      setStatus(
        "MISSING_SESSION",
      );

      setMessage(
        "Trình duyệt không còn dữ liệu phiên thanh toán và URL callback không đủ thông tin đã xác minh.",
      );
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      !pending ||
      isTerminal ||
      status ===
        "MISSING_SESSION" ||
      status ===
        "UNVERIFIED_CALLBACK"
    ) {
      return;
    }

    let attempts = 0;

    const timer =
      window.setInterval(
        () => {
          attempts += 1;

          if (
            attempts > 10
          ) {
            window.clearInterval(
              timer,
            );

            return;
          }

          void queryPayment(
            pending,
          );
        },
        5000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [
    isTerminal,
    pending,
    status,
  ]);

  const Icon =
    isSuccess
      ? CheckCircle2
      : isFailed
        ? XCircle
        : isCancelled ||
            isExpired ||
            status ===
              "MISSING_SESSION"
          ? AlertCircle
          : status ===
              "UNVERIFIED_CALLBACK"
            ? ShieldAlert
            : Clock3;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <Icon
        className={[
          "mx-auto h-16 w-16",
          isSuccess
            ? "text-green-700"
            : isTerminal ||
                status ===
                  "MISSING_SESSION" ||
                status ===
                  "UNVERIFIED_CALLBACK"
              ? "text-red-600"
              : "text-amber-600",
        ].join(" ")}
      />

      <h1 className="mt-6 text-3xl font-bold text-slate-950">
        {statusTitle}
      </h1>

      {pending ? (
        <p className="mt-3 text-slate-600">
          Đơn hàng:{" "}
          <strong className="text-slate-900">
            #
            {
              pending
                .orderNumber
            }
          </strong>
        </p>
      ) : null}

      <p className="mt-5 leading-7 text-slate-600">
        {message}
      </p>

      <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-600">
        <p>
          Trạng thái GPay:{" "}
          <strong className="text-slate-900">
            {status}
          </strong>
        </p>

        {transactionId ? (
          <p className="mt-2">
            Mã giao dịch:{" "}
            {transactionId}
          </p>
        ) : null}

        {paymentMethod ? (
          <p className="mt-2">
            Phương thức:{" "}
            {paymentMethod}
          </p>
        ) : null}

        {callbackVerified !==
        null ? (
          <p className="mt-2">
            Xác minh callback:{" "}
            <strong
              className={
                callbackVerified
                  ? "text-green-700"
                  : "text-amber-700"
              }
            >
              {callbackVerified
                ? "Hợp lệ"
                : "Chưa xác minh"}
            </strong>
          </p>
        ) : null}

        {verificationNote ? (
          <p className="mt-2 break-words text-xs text-slate-500">
            Cơ chế kiểm tra:{" "}
            {verificationNote}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {pending &&
        !isTerminal ? (
          <button
            type="button"
            disabled={
              isQuerying
            }
            onClick={() =>
              void queryPayment(
                pending,
              )
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {isQuerying ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Kiểm tra lại
          </button>
        ) : null}

        {pending?.billUrl &&
        !isSuccess ? (
          <a
            href={
              pending.billUrl
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:border-green-700 hover:text-green-700"
          >
            <ExternalLink className="h-4 w-4" />

            Thử thanh toán lại
          </a>
        ) : null}

        {isSuccess &&
        pending ? (
          <Link
            href={`/checkout/success?order=${encodeURIComponent(
              pending
                .orderNumber,
            )}&key=${encodeURIComponent(
              pending
                .orderKey,
            )}`}
            className="inline-flex h-11 items-center rounded-xl bg-green-700 px-6 text-sm font-semibold text-white hover:bg-green-800"
          >
            Xem kết quả đơn hàng
          </Link>
        ) : (
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:border-green-700 hover:text-green-700"
          >
            Quay lại Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
