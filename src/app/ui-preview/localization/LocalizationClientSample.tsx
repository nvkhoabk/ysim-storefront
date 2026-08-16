// F07A-2A_STATIC_LOCALIZATION_R1

"use client";

import { useTranslations } from "@/i18n/useTranslations";

interface LocalizationClientSampleProps {
  readonly serverGreeting: string;
}

export function LocalizationClientSample({
  serverGreeting,
}: LocalizationClientSampleProps) {
  const t = useTranslations();
  const clientGreeting = t("common.greeting.welcome", { brand: "YSim" });
  const matches = clientGreeting === serverGreeting;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">
        Client Component
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        {clientGreeting}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Server/client parity: {matches ? "PASS" : "FAIL"}
      </p>
    </div>
  );
}
