// F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1

import { normalizeShellLocale } from "../shell/shell.registry";
import type { ShellLocale } from "../shell/shell.types";
import { secondaryMessagesEn } from "./messages/en";
import { secondaryMessagesLo } from "./messages/lo";
import { secondaryMessagesVi } from "./messages/vi";
import type {
  SecondaryMessages,
  SecondaryTranslator,
  SecondaryView,
} from "./secondary.types";

export const SECONDARY_MESSAGE_CATALOG: Readonly<
  Record<ShellLocale, SecondaryMessages>
> = {
  vi: secondaryMessagesVi,
  en: secondaryMessagesEn,
  lo: secondaryMessagesLo,
};

const SECONDARY_VIEWS = [
  "offers",
  "guides",
  "support",
  "device-check",
  "package-assistant",
] as const satisfies readonly SecondaryView[];

export function normalizeSecondaryLocale(input: unknown): ShellLocale {
  return normalizeShellLocale(input);
}

export function normalizeSecondaryView(input: unknown): SecondaryView {
  return typeof input === "string" &&
    (SECONDARY_VIEWS as readonly string[]).includes(input)
    ? (input as SecondaryView)
    : "offers";
}

export function createSecondaryTranslator(
  localeInput: unknown,
): SecondaryTranslator {
  const locale = normalizeSecondaryLocale(localeInput);
  const messages = SECONDARY_MESSAGE_CATALOG[locale];
  const fallback = SECONDARY_MESSAGE_CATALOG.vi;

  return (key, params = {}) => {
    const template = messages[key] ?? fallback[key];
    if (!template)
      throw new Error(`SECONDARY_TRANSLATION_MISSING:${locale}:${key}`);
    return template.replace(
      /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g,
      (_, name: string) => {
        const value = params[name];
        if (value === undefined)
          throw new Error(`SECONDARY_PLACEHOLDER_MISSING:${key}:${name}`);
        return String(value);
      },
    );
  };
}
