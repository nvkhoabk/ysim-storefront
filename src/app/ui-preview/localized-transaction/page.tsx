// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1

import Link from "next/link";

import { PageShell } from "@/components/layout";
import { createLocalizedShellBundle } from "@/i18n/shell/shell.config";
import { createLocalizedTransactionBundle } from "@/i18n/transaction/transaction.config";
import {
  createTransactionTranslator,
  normalizeTransactionView,
} from "@/i18n/transaction/transaction.registry";
import type {
  TransactionTranslator,
  TransactionView,
} from "@/i18n/transaction/transaction.types";

interface LocalizedTransactionPreviewProps {
  readonly searchParams: Promise<{
    readonly locale?: string;
    readonly view?: string;
  }>;
}

const TABS: readonly TransactionView[] = [
  "cart",
  "checkout",
  "payment",
  "order-result",
];

function SourceSummary({
  t,
  transaction,
}: {
  readonly t: TransactionTranslator;
  readonly transaction: ReturnType<typeof createLocalizedTransactionBundle>;
}) {
  return (
    <aside
      aria-label={t("labels.orderSummary")}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <dl className="space-y-4">
        <div className="flex justify-between gap-4">
          <dt>{t("common.subtotal")}</dt>
          <dd className="font-bold">{transaction.sourceSubtotalLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t("common.currency")}</dt>
          <dd className="font-bold">{transaction.sourceCurrency}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-lg">
          <dt className="font-bold">{t("common.total")}</dt>
          <dd className="font-bold">{transaction.sourceTotalLabel}</dd>
        </div>
      </dl>
    </aside>
  );
}

function CartView({
  t,
  transaction,
}: {
  readonly t: TransactionTranslator;
  readonly transaction: ReturnType<typeof createLocalizedTransactionBundle>;
}) {
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
            {t("cart.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold">{t("cart.title")}</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {t("cart.description")}
          </p>
          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            {t("common.sourceNotice")}
          </p>
          <div aria-label={t("labels.cartItems")} className="mt-8 space-y-4">
            {transaction.cartItems.map((item) => (
              <article
                key={item.sku}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-bold tracking-[0.12em] text-emerald-700 uppercase">
                  {item.sku}
                </p>
                <h3 className="mt-3 text-xl font-bold">
                  {t("cart.sourceTitle", { title: item.sourceTitle })}
                </h3>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-500">{t("common.quantity")}</dt>
                    <dd className="mt-1 font-bold">{item.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("common.unitPrice")}</dt>
                    <dd className="mt-1 font-bold">
                      {item.sourceUnitPriceLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("common.lineTotal")}</dt>
                    <dd className="mt-1 font-bold">
                      {item.sourceLineTotalLabel}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled
                  className="mt-5 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-500"
                >
                  {t("cart.removeDisabled")}
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <SourceSummary t={t} transaction={transaction} />
          <Link
            href={transaction.routes.preview.checkout}
            className="inline-flex w-full justify-center rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
          >
            {t("cart.checkoutAction")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CheckoutView({
  t,
  transaction,
}: {
  readonly t: TransactionTranslator;
  readonly transaction: ReturnType<typeof createLocalizedTransactionBundle>;
}) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
            {t("checkout.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold">{t("checkout.title")}</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {t("checkout.description")}
          </p>
          <fieldset
            disabled
            aria-label={t("labels.checkoutFields")}
            className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2"
          >
            <legend className="px-2 text-lg font-bold">
              {t("checkout.contactTitle")}
            </legend>
            <label className="font-semibold">
              {t("checkout.emailLabel")}
              <input
                type="email"
                placeholder={t("checkout.emailPlaceholder")}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
            <label className="font-semibold">
              {t("checkout.phoneLabel")}
              <input
                type="tel"
                placeholder={t("checkout.phonePlaceholder")}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
            <label className="font-semibold">
              {t("checkout.fullNameLabel")}
              <input
                placeholder={t("checkout.fullNamePlaceholder")}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
            <label className="font-semibold">
              {t("checkout.noteLabel")}
              <textarea
                placeholder={t("checkout.notePlaceholder")}
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
            <button
              type="button"
              disabled
              className="rounded-full bg-emerald-700 px-5 py-3 font-bold text-white md:col-span-2"
            >
              {t("checkout.paymentAction")}
            </button>
          </fieldset>
          <p className="mt-4 text-sm text-slate-500">
            {t("checkout.disabledNotice")}
          </p>
        </div>
        <SourceSummary t={t} transaction={transaction} />
      </div>
    </section>
  );
}

function PaymentView({
  t,
  transaction,
}: {
  readonly t: TransactionTranslator;
  readonly transaction: ReturnType<typeof createLocalizedTransactionBundle>;
}) {
  const methods = [
    ["payment.gpayTitle", "payment.gpayDescription"],
    ["payment.onepayTitle", "payment.onepayDescription"],
    ["payment.manualTitle", "payment.manualDescription"],
  ] as const;
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
            {t("payment.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold">{t("payment.title")}</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {t("payment.description")}
          </p>
          <fieldset
            disabled
            aria-label={t("labels.paymentMethods")}
            className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6"
          >
            {methods.map(([title, description], index) => (
              <label
                key={title}
                className="flex gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <input
                  type="radio"
                  name="payment-preview"
                  defaultChecked={index === 0}
                />
                <span>
                  <strong className="block">{t(title)}</strong>
                  <span className="mt-1 block text-sm text-slate-600">
                    {t(description)}
                  </span>
                </span>
              </label>
            ))}
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
            >
              {t("payment.createAction")}
            </button>
          </fieldset>
          <p className="mt-4 text-sm text-slate-500">
            {t("payment.disabledNotice")}
          </p>
        </div>
        <div className="space-y-5">
          <SourceSummary t={t} transaction={transaction} />
          <article className="rounded-3xl bg-emerald-950 p-6 text-white">
            <h3 className="text-xl font-bold">{t("payment.pendingTitle")}</h3>
            <p className="mt-3 text-emerald-100">
              {t("payment.pendingStatus")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function OrderResultView({
  t,
  transaction,
}: {
  readonly t: TransactionTranslator;
  readonly transaction: ReturnType<typeof createLocalizedTransactionBundle>;
}) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-[0.12em] text-emerald-700 uppercase">
          {t("order.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold">{t("order.title")}</h2>
        <p className="mt-4 leading-7 text-slate-600">
          {t("order.description")}
        </p>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <span className="text-sm text-slate-500">{t("order.codeLabel")}</span>
          <strong className="mt-1 block text-xl">
            {transaction.order.orderCode}
          </strong>
        </div>
        <ol
          aria-label={t("labels.orderTimeline")}
          className="mt-8 grid gap-5 md:grid-cols-3"
        >
          <li className="rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold">{t("order.paymentTitle")}</h3>
            <p className="mt-2 text-slate-600">{t("order.paymentStatus")}</p>
            <p className="mt-3 text-sm">
              {t("common.provider")}: {transaction.order.paymentProvider}
            </p>
            <p className="mt-1 text-sm">
              {t("common.reference")}: {transaction.order.paymentReference}
            </p>
          </li>
          <li className="rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold">{t("order.fulfillmentTitle")}</h3>
            <p className="mt-2 text-slate-600">
              {t("order.fulfillmentStatus")}
            </p>
          </li>
          <li className="rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold">{t("order.deliveryTitle")}</h3>
            <p className="mt-2 text-slate-600">
              {t("order.deliveryStatus", {
                channel: transaction.order.deliveryChannel,
              })}
            </p>
          </li>
        </ol>
        <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          {t("order.securityNotice")}
        </p>
        <Link
          href={transaction.routes.preview.cart}
          className="mt-6 inline-flex rounded-full bg-emerald-700 px-5 py-3 font-bold text-white"
        >
          {t("order.startAgain")}
        </Link>
      </div>
    </section>
  );
}

export default async function LocalizedTransactionPreviewPage({
  searchParams,
}: LocalizedTransactionPreviewProps) {
  const params = await searchParams;
  const transaction = createLocalizedTransactionBundle(params.locale);
  const shell = createLocalizedShellBundle(transaction.locale);
  const t = createTransactionTranslator(transaction.locale);
  const view = normalizeTransactionView(params.view);

  return (
    <div lang={transaction.htmlLang} dir={transaction.direction}>
      <PageShell
        headerConfig={shell.navigation}
        footerConfig={shell.footer}
        shellLabels={shell.labels}
        locale={shell.locale}
        languageSwitch={{
          mode: "preview",
          previewPath: "/ui-preview/localized-transaction",
        }}
        homeHref={`/ui-preview/localized-transaction?locale=${transaction.locale}&view=${view}`}
      >
        <article aria-label={t("labels.preview")}>
          <section className="bg-emerald-950 py-14 text-white sm:py-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
                  F07A-2D-1 · {transaction.marketId} · {transaction.currency}
                </p>
                <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                  {t("preview.title")}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50">
                  {t("preview.description")}
                </p>
                <p className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
                  {t("preview.candidate")}
                </p>
              </div>
              <aside className="rounded-3xl border border-white/20 bg-white/10 p-6">
                <p className="text-sm leading-6">
                  {t("preview.sourceMoney", { currency: transaction.currency })}
                </p>
                <p className="mt-4 text-sm leading-6">
                  {t("preview.noMutation")}
                </p>
                <nav
                  aria-label={t("labels.localeNavigation")}
                  className="mt-6 flex gap-2"
                >
                  {(["vi", "en", "lo"] as const).map((locale) => (
                    <Link
                      key={locale}
                      href={`/ui-preview/localized-transaction?locale=${locale}&view=${view}`}
                      aria-current={
                        locale === transaction.locale ? "page" : undefined
                      }
                      className="rounded-full border border-white/30 px-3 py-2 text-xs font-bold"
                    >
                      {locale.toUpperCase()}
                    </Link>
                  ))}
                </nav>
              </aside>
            </div>
          </section>
          <nav
            aria-label={t("labels.tabs")}
            className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-5 sm:px-6 lg:px-8"
          >
            {TABS.map((tab) => (
              <Link
                key={tab}
                href={transaction.routes.preview[tab]}
                aria-current={tab === view ? "page" : undefined}
                className={`rounded-full px-4 py-3 text-sm font-bold ${tab === view ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {t(`tabs.${tab === "order-result" ? "orderResult" : tab}`)}
              </Link>
            ))}
          </nav>
          {view === "cart" ? (
            <CartView t={t} transaction={transaction} />
          ) : null}
          {view === "checkout" ? (
            <CheckoutView t={t} transaction={transaction} />
          ) : null}
          {view === "payment" ? (
            <PaymentView t={t} transaction={transaction} />
          ) : null}
          {view === "order-result" ? (
            <OrderResultView t={t} transaction={transaction} />
          ) : null}
        </article>
      </PageShell>
    </div>
  );
}
