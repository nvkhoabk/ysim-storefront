import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

import { PageShell } from "@/components/layout";
import {
  getStorefrontLocaleRequest,
  withLocalizedAlternates,
} from "@/i18n/runtime/runtime.server";
import { localizeShellHref } from "@/i18n/shell/shell.href";
import { createTransactionTranslator } from "@/i18n/transaction/transaction.registry";

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string;
    key?: string;
  }>;
}

export async function generateMetadata() {
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);
  return withLocalizedAlternates(
    {
      title: `${t("success.title")} | YSim`,
      robots: { index: false, follow: false },
    },
    request,
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order } = await searchParams;
  const request = await getStorefrontLocaleRequest();
  const t = createTransactionTranslator(request.shell.locale);

  return (
    <PageShell>
      <main className="min-h-[70vh] bg-slate-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-700" />

          <h1 className="mt-6 text-3xl font-bold text-slate-950">
            {t("success.title")}
          </h1>

          {order ? (
            <p className="mt-3 text-slate-600">
              {t("success.orderCode")}:{" "}
              <strong className="text-slate-900">#{order}</strong>
            </p>
          ) : null}

          <div className="mt-8 rounded-2xl bg-green-50 p-5">
            <Mail className="mx-auto h-7 w-7 text-green-700" />

            <p className="mt-3 font-semibold text-slate-900">
              {t("success.emailTitle")}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("success.emailDescription")}
            </p>
          </div>

          <Link
            href={localizeShellHref("/", request.shell.locale)}
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-green-700 px-6 text-sm font-semibold text-white hover:bg-green-800"
          >
            {t("success.home")}
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
