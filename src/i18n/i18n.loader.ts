// F07A-2A_STATIC_LOCALIZATION_R1

import type { LocaleMessages } from "./i18n.types";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  MESSAGE_CATALOG,
  type SupportedLocale,
} from "./i18n.registry";

export function normalizeLocale(value: unknown): SupportedLocale {
  if (typeof value !== "string") return DEFAULT_LOCALE;
  const normalized = value.trim().toLowerCase().split("-")[0];
  return isSupportedLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

export function getMessages(locale: unknown): LocaleMessages {
  return MESSAGE_CATALOG[normalizeLocale(locale)];
}

export async function loadMessages(
  locale: unknown,
): Promise<{
  readonly locale: SupportedLocale;
  readonly messages: LocaleMessages;
}> {
  const normalizedLocale = normalizeLocale(locale);
  return {
    locale: normalizedLocale,
    messages: MESSAGE_CATALOG[normalizedLocale],
  };
}
