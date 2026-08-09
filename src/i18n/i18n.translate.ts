// F07A-2A_STATIC_LOCALIZATION_R1

import { DEFAULT_LOCALE, type SupportedLocale } from "./i18n.registry";
import { getMessages, normalizeLocale } from "./i18n.loader";
import type {
  I18nRuntimeMode,
  LocaleMessages,
  MessageTree,
  MessageValues,
  TranslationFunction,
} from "./i18n.types";

interface CreateTranslatorOptions {
  readonly locale: unknown;
  readonly messages?: LocaleMessages;
  readonly fallbackMessages?: LocaleMessages;
  readonly mode?: I18nRuntimeMode;
  readonly onMissing?: (key: string, locale: SupportedLocale) => void;
}

function getNestedMessage(
  messages: LocaleMessages,
  key: string,
): string | undefined {
  const segments = key.split(".").filter(Boolean);
  let current: string | MessageTree = messages;

  for (const segment of segments) {
    if (typeof current === "string") return undefined;
    const next: string | MessageTree | undefined = current[segment];
    if (next === undefined) return undefined;
    current = next;
  }

  return typeof current === "string" ? current : undefined;
}

function runtimeMode(): I18nRuntimeMode {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function interpolateMessage(
  template: string,
  values: MessageValues = {},
  mode: I18nRuntimeMode = runtimeMode(),
): string {
  return template.replace(
    /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
    (placeholder, name: string) => {
      const value = values[name];
      if (value === undefined) {
        if (mode === "development") {
          throw new Error(`I18N_INTERPOLATION_VALUE_MISSING:${name}`);
        }
        return placeholder;
      }
      return String(value);
    },
  );
}

export function createTranslator({
  locale,
  messages,
  fallbackMessages,
  mode = runtimeMode(),
  onMissing,
}: CreateTranslatorOptions): TranslationFunction {
  const normalizedLocale = normalizeLocale(locale);
  const localeMessages = messages ?? getMessages(normalizedLocale);
  const defaultMessages = fallbackMessages ?? getMessages(DEFAULT_LOCALE);

  return (key, values = {}) => {
    const localizedTemplate = getNestedMessage(localeMessages, key);
    if (localizedTemplate !== undefined) {
      return interpolateMessage(localizedTemplate, values, mode);
    }

    onMissing?.(key, normalizedLocale);
    if (mode === "development") {
      throw new Error(`I18N_TRANSLATION_MISSING:${normalizedLocale}:${key}`);
    }

    const fallbackTemplate = getNestedMessage(defaultMessages, key);
    if (fallbackTemplate !== undefined) {
      return interpolateMessage(fallbackTemplate, values, mode);
    }

    return key;
  };
}

export function translate(
  locale: unknown,
  key: string,
  values: MessageValues = {},
  mode?: I18nRuntimeMode,
): string {
  return createTranslator({ locale, mode })(key, values);
}
