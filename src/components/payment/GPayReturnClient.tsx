"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

interface PendingGPayPayment {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  provider: string;
  gpayBillId: string;
  merchantOrderId: string;
  billUrl: string;
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

const STORAGE_KEY = "ysim:gpay:pending-payment";
const SUCCESS_STATUSES = new Set(["ORDER_SUCCESS", "SUCCESS", "PAID"]);
const FAILED_STATUSES = new Set([
  "ORDER_FAILED",
  "FAILED",
  "CANCELLED",
  "CANCELED",
  "EXPIRED",
]);

export function GPayReturnClient() {
  const [pending, setPending] = useState<PendingGPayPayment | null>(null);
  const [status, setStatus] = useState("CHECKING");
  const [message, setMessage] = useState("Đang kiểm tra trạng thái thanh toán...");
  const [transactionId, setTransactionId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>();
  const [isQuerying, setIsQuerying] = useState(false);

  const isSuccess = SUCCESS_STATUSES.has(status);
  const isFailed = FAILED_STATUSES.has(status);

  const statusTitle = useMemo(() => {
    if (isSuccess) return "Thanh toán thành công";
    if (isFailed) return "Thanh toán chưa thành công";
    if (status === "MISSING_SESSION") return "Không tìm thấy phiên thanh toán";
    return "Đang chờ GPay xác nhận";
  }, [isFailed, isSuccess, status]);

  async function queryPayment(current: PendingGPayPayment) {
    setIsQuerying(true);

    try {
      const response = await fetch("/api/payments/gpay/query-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          gpayBillId: current.gpayBillId,
          merchantOrderId: current.merchantOrderId,
          orderId: current.orderId,
          orderKey: current.orderKey,
        }),
      });

      const data = (await response.json()) as QueryResponse;

      if (!response.ok || !data.success || !data.payment) {
        throw new Error(data.message || "Không thể truy vấn GPay.");
      }

      const nextStatus = data.payment.status?.trim() || "PENDING";
      setStatus(nextStatus);
      setTransactionId(data.payment.gpayTransactionId);
      setPaymentMethod(data.payment.userPaymentMethod);

      if (SUCCESS_STATUSES.has(nextStatus)) {
        setMessage("GPay đã xác nhận giao dịch thành công.");
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      if (FAILED_STATUSES.has(nextStatus)) {
        setMessage("Giao dịch đã thất bại, bị hủy hoặc hết hạn.");
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

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setStatus("MISSING_SESSION");
      setMessage(
        "Trình duyệt không còn dữ liệu phiên thanh toán. Hãy quay lại Checkout hoặc mở lại liên kết thanh toán từ đơn hàng.",
      );
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PendingGPayPayment;
      setPending(parsed);
      void queryPayment(parsed);
    } catch {
      setStatus("MISSING_SESSION");
      setMessage("Dữ liệu phiên thanh toán trong trình duyệt không hợp lệ.");
    }
  }, []);

  useEffect(() => {
    if (!pending || isSuccess || isFailed || status === "MISSING_SESSION") {
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (attempts > 10) {
        window.clearInterval(timer);
        return;
      }

      void queryPayment(pending);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isFailed, isSuccess, pending, status]);

  const Icon = isSuccess
    ? CheckCircle2
    : isFailed || status === "MISSING_SESSION"
      ? AlertCircle
      : Clock3;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <Icon
        className={`mx-auto h-16 w-16 ${
          isSuccess
            ? "text-green-700"
            : isFailed || status === "MISSING_SESSION"
              ? "text-red-600"
              : "text-amber-600"
        }`}
      />

      <h1 className="mt-6 text-3xl font-bold text-slate-950">{statusTitle}</h1>

      {pending ? (
        <p className="mt-3 text-slate-600">
          Đơn hàng: <strong className="text-slate-900">#{pending.orderNumber}</strong>
        </p>
      ) : null}

      <p className="mt-5 leading-7 text-slate-600">{message}</p>

      <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-600">
        <p>
          Trạng thái GPay: <strong className="text-slate-900">{status}</strong>
        </p>
        {transactionId ? <p className="mt-2">Mã giao dịch: {transactionId}</p> : null}
        {paymentMethod ? <p className="mt-2">Phương thức: {paymentMethod}</p> : null}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {pending && !isSuccess ? (
          <button
            type="button"
            disabled={isQuerying}
            onClick={() => void queryPayment(pending)}
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

        {pending && !isSuccess ? (
          <a
            href={pending.billUrl}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:border-green-700 hover:text-green-700"
          >
            <ExternalLink className="h-4 w-4" />
            Mở lại GPay
          </a>
        ) : null}

        {isSuccess && pending ? (
          <Link
            href={`/checkout/success?order=${encodeURIComponent(pending.orderNumber)}&key=${encodeURIComponent(pending.orderKey)}`}
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
