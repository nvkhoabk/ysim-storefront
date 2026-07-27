"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import type { PaymentSession } from "@/features/payments/payment.types";

interface VirtualAccountPaymentPanelProps {
  session: PaymentSession;
  orderKey: string;
}

interface VAStatusResponse {
  success: boolean;
  paid?: boolean;
  orderStatus?: string;
  paymentStatus?: string;
  vaStatus?: string;
  message?: string;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VirtualAccountPaymentPanel({
  session,
  orderKey,
}: VirtualAccountPaymentPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState("Đang chờ thanh toán");
  const [copyMessage, setCopyMessage] = useState("");
  const [pollError, setPollError] = useState<string | null>(null);

  const statusUrl = useMemo(() => {
    const params = new URLSearchParams({
      orderId: String(session.orderId),
      key: orderKey,
    });

    return `/api/payments/gpay/virtual-account/status?${params.toString()}`;
  }, [orderKey, session.orderId]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const response = await fetch(statusUrl, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const body = (await response.json()) as VAStatusResponse;

        if (!response.ok || !body.success) {
          throw new Error(body.message || "Không thể kiểm tra thanh toán.");
        }

        if (cancelled) {
          return;
        }

        setPollError(null);

        if (body.paid) {
          setStatus("Thanh toán đã được xác nhận");
          router.replace(
            `/checkout/success?order=${encodeURIComponent(
              session.orderNumber,
            )}&key=${encodeURIComponent(orderKey)}`,
          );
          return;
        }

        if (body.paymentStatus === "AMOUNT_MISMATCH") {
          setStatus("Giao dịch cần được kiểm tra");
          return;
        }

        timer = setTimeout(poll, 5000);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPollError(
          error instanceof Error
            ? error.message
            : "Tạm thời chưa kiểm tra được thanh toán.",
        );
        timer = setTimeout(poll, 10_000);
      }
    }

    void poll();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [orderKey, router, session.orderNumber, statusUrl]);

  async function copy(value: string | undefined, label: string) {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`Đã sao chép ${label}.`);
    } catch {
      setCopyMessage(`Không thể sao chép ${label}.`);
    }
  }

  return (
    <section className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-700">
            Đơn hàng #{session.orderNumber}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Quét QR để thanh toán
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chuyển đúng số tiền và giữ nguyên nội dung để hệ thống tự động khớp
            giao dịch.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          <Clock3 className="h-4 w-4" />
          {status}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {session.qr?.image ? (
            <Image
              src={session.qr.image}
              alt={`Mã VietQR cho đơn hàng ${session.orderNumber}`}
              width={640}
              height={640}
              unoptimized
              className="h-auto w-full rounded-xl bg-white"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-white text-center text-sm text-slate-500">
              GPay chưa trả ảnh QR. Vui lòng dùng thông tin tài khoản bên cạnh.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Số tiền</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {money(session.amount, session.currency)}
            </p>
          </div>

          <PaymentCopyRow
            label="Ngân hàng"
            value={session.qr?.bankCode || session.qr?.provider || "BIDV"}
          />
          <PaymentCopyRow
            label="Số tài khoản ảo"
            value={session.qr?.accountNumber || ""}
            onCopy={() => void copy(session.qr?.accountNumber, "số tài khoản")}
          />
          <PaymentCopyRow
            label="Tên tài khoản"
            value={session.qr?.accountName || ""}
          />
          <PaymentCopyRow
            label="Nội dung chuyển khoản"
            value={session.qr?.remark || session.merchantTransactionId}
            onCopy={() =>
              void copy(
                session.qr?.remark || session.merchantTransactionId,
                "nội dung chuyển khoản",
              )
            }
          />

          {session.expiresAt ? (
            <p className="text-sm text-slate-500">
              Hiệu lực đến:{" "}
              <strong className="text-slate-700">{session.expiresAt}</strong>
            </p>
          ) : null}

          <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              YSim chỉ xác nhận khi số tài khoản, số tiền và giao dịch GPay khớp
              với đơn hàng.
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <LoaderCircle className="h-4 w-4 animate-spin text-green-700" />
            Hệ thống đang tự động kiểm tra giao dịch.
          </div>

          {copyMessage ? (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {copyMessage}
            </p>
          ) : null}

          {pollError ? (
            <p className="text-sm text-amber-700">{pollError}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PaymentCopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-4">
        <p className="font-semibold break-all text-slate-950">{value || "—"}</p>
        {onCopy && value ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" />
            Sao chép
          </button>
        ) : null}
      </div>
    </div>
  );
}
