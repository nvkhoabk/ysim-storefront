/**
 * Shared models used across YSim Storefront.
 */

export type LocaleCode = string;

export type CurrencyCode = string;

export interface ApiCollection<T> {
  items: T[];
  count: number;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
}

export interface ImageResource {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
}
