"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  LoaderCircle,
  RefreshCcw,
  ShieldX,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import {
  lookupSecureOrderCandidate,
} from "@/features/orders/candidate/order-candidate-client";

import type {
  CheckoutOrderHandoff,
} from "@/types/view-models/checkout-route-candidate";

import type {
  OrderRouteCandidateConfigViewModel,
  SecureOrderLookupResponse,
} from "@/types/view-models/order-route-candidate";

import {
  OrderCandidateDiagnostics,
} from "./OrderCandidateDiagnostics";

import {
  SecureOrderResultComposition,
} from "./SecureOrderResultComposition";

const handoffStorageKey =
  "ysim-checkout-order-handoff";

function parseHandoff(
  value:
    | string
    | null,
): CheckoutOrderHandoff | null {
  if (!value) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        value,
      ) as
        CheckoutOrderHandoff;

    if (
      !parsed.orderId ||
      !parsed.orderKey ||
      !parsed.orderNumber
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function OrderCandidateClient({
  config,
  orderCode,
}: {
  config:
    OrderRouteCandidateConfigViewModel;
  orderCode?: string;
}) {
  const [
    handoff,
    setHandoff,
  ] =
    useState<
      CheckoutOrderHandoff | null
    >(null);

  const [
    result,
    setResult,
  ] =
    useState<
      SecureOrderLookupResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function load(
    proof:
      CheckoutOrderHandoff,
  ) {
    setLoading(
      true,
    );
    setError(
      null,
    );

    try {
      const response =
        await lookupSecureOrderCandidate({
          orderId:
            proof.orderId,
          orderKey:
            proof.orderKey,
        });

      if (
        orderCode &&
        response.proof
          .orderNumber !==
        orderCode
      ) {
        throw new Error(
          "Mã đơn trên URL không khớp guest access proof.",
        );
      }

      setResult(
        response,
      );
    } catch (
      caught
    ) {
      setResult(
        null,
      );
      setError(
        caught instanceof
          Error
          ? caught.message
          : "Không thể tải đơn hàng.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(
    () => {
      const proof =
        parseHandoff(
          window.sessionStorage.getItem(
            handoffStorageKey,
          ),
        );

      setHandoff(
        proof,
      );

      if (!proof) {
        setLoading(
          false,
        );
        return;
      }

      void load(
        proof,
      );
    },
    [
      orderCode,
    ],
  );

  if (
    loading
  ) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container>
            <div className="flex min-h-[25rem] items-center justify-center gap-3 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--ysim-color-brand-700)]" />
              Đang xác minh và tải đơn hàng...
            </div>
          </Container>
        </Section>

        <OrderCandidateDiagnostics
          config={
            config
          }
        />
      </PageShell>
    );
  }

  if (
    result
  ) {
    return (
      <>
        <SecureOrderResultComposition
          order={
            result.order
          }
          verifiedAt={
            result.proof
              .verifiedAt
          }
        />

        <OrderCandidateDiagnostics
          config={
            config
          }
        />
      </>
    );
  }

  if (!handoff) {
    return (
      <PageShell
        cartCount={0}
      >
        <Section spacing="lg">
          <Container size="content">
            <div className="rounded-[var(--ysim-radius-xl)] border border-amber-200 bg-amber-50 p-9 text-center">
              <ShieldX className="mx-auto h-12 w-12 text-amber-700" />

              <h1 className="mt-5 text-3xl font-bold text-amber-950">
                Chưa có guest access proof
              </h1>

              <p className="mt-3 text-sm font-semibold leading-relaxed text-amber-900">
                Mã đơn trên URL không đủ để truy cập. Hãy tạo đơn bằng Checkout Candidate trong cùng browser session.
              </p>

              <Link
                href="/ui-preview/checkout-route-candidate"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--ysim-radius-md)] bg-amber-800 px-6 text-sm font-bold text-white"
              >
                Mở Checkout Candidate
              </Link>
            </div>
          </Container>
        </Section>

        <OrderCandidateDiagnostics
          config={
            config
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      cartCount={0}
    >
      <Section spacing="lg">
        <Container size="content">
          <div className="rounded-[var(--ysim-radius-xl)] border border-red-200 bg-red-50 p-9 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-700" />

            <h1 className="mt-5 text-3xl font-bold text-red-950">
              Không thể tải đơn hàng
            </h1>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-red-900">
              {
                error ||
                "Không thể xác minh quyền truy cập đơn hàng."
              }
            </p>

            <button
              type="button"
              onClick={() =>
                void load(
                  handoff,
                )
              }
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-red-800 px-6 text-sm font-bold text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        </Container>
      </Section>

      <OrderCandidateDiagnostics
        config={
          config
        }
      />
    </PageShell>
  );
}
