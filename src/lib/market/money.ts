// F07A-1A_MARKET_DOMAIN_V1

import type { CurrencyMinorUnit, DecimalRate } from "./market.types";

function pow10(exponent: CurrencyMinorUnit): bigint {
  let value = BigInt(1);
  for (let index = 0; index < exponent; index += 1) {
    value *= BigInt(10);
  }
  return value;
}

function absolute(value: bigint): bigint {
  return value < BigInt(0) ? -value : value;
}

function assertRate(rate: DecimalRate): void {
  if (rate.numerator <= BigInt(0) || rate.denominator <= BigInt(0)) {
    throw new Error("MONEY_INVALID_RATE");
  }
  if (!rate.source.trim() || !rate.version.trim() || !rate.effectiveAt.trim()) {
    throw new Error("MONEY_INCOMPLETE_RATE_METADATA");
  }
}

/**
 * Converts integer minor units with integer arithmetic only.
 * Rate semantics: target major units per one source major unit.
 * Rounding policy: half away from zero.
 */
export function convertMinorAmount(
  sourceAmountMinor: bigint,
  sourceMinorUnit: CurrencyMinorUnit,
  targetMinorUnit: CurrencyMinorUnit,
  rate: DecimalRate,
): bigint {
  assertRate(rate);

  const sign = sourceAmountMinor < BigInt(0) ? BigInt(-1) : BigInt(1);
  const numerator =
    absolute(sourceAmountMinor) * rate.numerator * pow10(targetMinorUnit);
  const denominator = rate.denominator * pow10(sourceMinorUnit);
  let quotient = numerator / denominator;
  const remainder = numerator % denominator;

  if (remainder * BigInt(2) >= denominator) {
    quotient += BigInt(1);
  }

  return quotient * sign;
}

export function minorAmountToDecimalString(
  amountMinor: bigint,
  minorUnit: CurrencyMinorUnit,
): string {
  const negative = amountMinor < BigInt(0);
  const absoluteAmount = absolute(amountMinor);
  const scale = pow10(minorUnit);
  const integerPart = absoluteAmount / scale;
  const fractionPart = absoluteAmount % scale;
  const sign = negative ? "-" : "";

  if (minorUnit === 0) return `${sign}${integerPart.toString()}`;

  return `${sign}${integerPart.toString()}.${fractionPart
    .toString()
    .padStart(minorUnit, "0")}`;
}

function localeMinusSign(locale: string): string {
  return (
    new Intl.NumberFormat(locale)
      .formatToParts(-1)
      .find((part) => part.type === "minusSign")?.value ?? "-"
  );
}

function currencyPattern(
  locale: string,
  currency: string,
  minorUnit: CurrencyMinorUnit,
): { prefix: string; suffix: string; decimal: string } {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  });
  const probe = minorUnit > 0 ? 1.1 : 1;
  const parts = formatter.formatToParts(probe);
  const numericTypes = new Set(["integer", "group", "decimal", "fraction"]);
  const firstNumeric = parts.findIndex((part) => numericTypes.has(part.type));
  let lastNumeric = -1;
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    if (numericTypes.has(parts[index].type)) {
      lastNumeric = index;
      break;
    }
  }
  const prefix = parts
    .slice(0, firstNumeric)
    .filter((part) => part.type !== "minusSign" && part.type !== "plusSign")
    .map((part) => part.value)
    .join("");
  const suffix = parts
    .slice(lastNumeric + 1)
    .filter((part) => part.type !== "minusSign" && part.type !== "plusSign")
    .map((part) => part.value)
    .join("");
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  return { prefix, suffix, decimal };
}

/** Formats an already-calculated integer minor amount without using it as a Number. */
export function formatMoneyMinor(
  amountMinor: bigint,
  currency: string,
  locale: string,
  minorUnit: CurrencyMinorUnit,
): string {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error(`MONEY_INVALID_CURRENCY:${currency}`);
  }

  const negative = amountMinor < BigInt(0);
  const decimal = minorAmountToDecimalString(absolute(amountMinor), minorUnit);
  const [integerPart, fractionPart] = decimal.split(".");
  const groupedInteger = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(BigInt(integerPart));
  const pattern = currencyPattern(locale, currency, minorUnit);
  const localizedNumber = fractionPart
    ? `${groupedInteger}${pattern.decimal}${fractionPart}`
    : groupedInteger;
  const sign = negative ? localeMinusSign(locale) : "";

  return `${pattern.prefix}${sign}${localizedNumber}${pattern.suffix}`;
}
