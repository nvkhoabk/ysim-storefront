import Link from "next/link";
import { ChevronLeft, LockKeyhole } from "lucide-react";

import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { PageShell } from "@/components/layout";
import type { Metadata } from "next";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { createTransactionTranslator } from "@/i18n/transaction/transaction.registry";
import { localizeShellHref } from "@/i18n/shell/shell.href";

const baseMetadata: Metadata = {
  title: "Thanh toán",
  description: "Hoàn tất đơn hàng eSIM YSim an toàn và nhanh chóng.",
};

const secureConnectionCopy = {
  vi: "Kết nối bảo mật",
  en: "Secure connection",
  lo: "ການເຊື່ອມຕໍ່ປອດໄພ",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);
  return withLocalizedAlternates(
    {
      ...baseMetadata,
      title: `${t("checkout.title")} | YSim`,
      description: t("checkout.description"),
    },
    request,
  );
}

export default async function CheckoutPage() {
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);

  return (
    <PageShell showFooter={false}>
      <main className="min-h-screen bg-slate-50 px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link
                href={localizeShellHref("/cart", request.shell.locale)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-green-700"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common.back")}
              </Link>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {t("checkout.title")}
              </h1>

              <p className="mt-3 text-slate-600">{t("checkout.description")}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LockKeyhole className="h-4 w-4 text-green-700" />
              {secureConnectionCopy[request.shell.locale]}
            </div>
          </div>

          <CheckoutContent />
        </div>
      </main>
    </PageShell>
  );
}
