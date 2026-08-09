// F07A-2A_STATIC_LOCALIZATION_R1

export type MessagePrimitive = string;

export interface MessageTree {
  readonly [key: string]: MessagePrimitive | MessageTree;
}

export const MESSAGE_NAMESPACES = [
  "common",
  "navigation",
  "market",
  "validation",
] as const;

export type MessageNamespace = (typeof MESSAGE_NAMESPACES)[number];

export type LocaleMessages = Readonly<Record<MessageNamespace, MessageTree>>;

export type MessageValues = Readonly<
  Record<string, string | number | bigint | boolean>
>;

export type I18nRuntimeMode = "development" | "production";

export type TranslationFunction = (
  key: string,
  values?: MessageValues,
) => string;

export interface MessageCatalogValidation {
  readonly locales: readonly string[];
  readonly namespaces: readonly MessageNamespace[];
  readonly keyCount: number;
  readonly referenceLocale: string;
}
