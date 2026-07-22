import type {
  DestinationContinentKey,
} from "@/types/view-models/destination-page";

export interface ProductionDestinationCatalogMetadata {
  canonicalSlug: string;
  continent:
    Exclude<
      DestinationContinentKey,
      "all"
    >;
  continentLabel: string;
  popularityBase: number;
}

export const productionDestinationCatalogMetadata:
  Readonly<
    Record<
      string,
      ProductionDestinationCatalogMetadata
    >
  > = {
    japan: {
      canonicalSlug:
        "japan",
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularityBase:
        100,
    },
    korea: {
      canonicalSlug:
        "korea",
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularityBase:
        92,
    },
    thailand: {
      canonicalSlug:
        "thailand",
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularityBase:
        88,
    },
    singapore: {
      canonicalSlug:
        "singapore",
      continent:
        "asia",
      continentLabel:
        "Châu Á",
      popularityBase:
        80,
    },
    usa: {
      canonicalSlug:
        "usa",
      continent:
        "north-america",
      continentLabel:
        "Bắc Mỹ",
      popularityBase:
        75,
    },
    europe: {
      canonicalSlug:
        "europe",
      continent:
        "europe",
      continentLabel:
        "Châu Âu",
      popularityBase:
        85,
    },
  };

export const destinationDailySignals = [
  "daily",
  "per day",
  "day",
  "/day",
  "moi ngay",
  "theo ngay",
  "hang ngay",
  "/ngay",
] as const;

export const destinationUnlimitedSignals = [
  "unlimited",
  "khong gioi han",
  "vo han",
  "khong han che",
] as const;

export const destinationTotalSignals = [
  "total",
  "fixed",
  "tron goi",
  "tong dung luong",
  "gb",
  "mb",
] as const;
