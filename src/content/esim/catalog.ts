import type {
  EsimCatalogBenefit,
  EsimCatalogCategory,
  EsimCatalogEmptyState,
  EsimContinent,
  EsimSpecialDestination,
} from "@/components/esim/catalog/types";

export const esimCatalogCategories: EsimCatalogCategory[] = [
  {
    key: "country",
    title: "eSIM Quốc gia",
    description: "eSIM cho từng quốc gia",
  },
  {
    key: "region",
    title: "eSIM Khu vực",
    description:
      "eSIM dùng tại nhiều quốc gia trong cùng khu vực",
  },
  {
    key: "global",
    title: "eSIM Toàn cầu",
    description:
      "Kết nối tại hơn 200 quốc gia và vùng lãnh thổ",
  },
];

export const esimCatalogBenefits: EsimCatalogBenefit[] = [
  {
    id: "activation",
    title: "Kích hoạt trong 1 phút",
  },
  {
    id: "digital",
    title: "Không cần SIM vật lý",
  },
  {
    id: "keep-number",
    title: "Giữ nguyên số Việt Nam",
  },
  {
    id: "support",
    title: "Hỗ trợ 24/7 tiếng Việt",
  },
];

export const esimContinents: EsimContinent[] = [
  {
    key: "asia",
    title: "Châu Á",
    slug: "asia",
    href: "/destinations?continent=asia",
    totalLabel: "Xem tất cả (50+)",
    countries: [
      {
        code: "JP",
        name: "Nhật Bản",
        slug: "japan",
        href: "/destinations/japan",
        popular: true,
      },
      {
        code: "KR",
        name: "Hàn Quốc",
        slug: "south-korea",
        href: "/destinations/south-korea",
        popular: true,
      },
      {
        code: "SG",
        name: "Singapore",
        slug: "singapore",
        href: "/destinations/singapore",
        popular: true,
      },
      {
        code: "TH",
        name: "Thái Lan",
        slug: "thailand",
        href: "/destinations/thailand",
        popular: true,
      },
      {
        code: "TW",
        name: "Đài Loan",
        slug: "taiwan",
        href: "/destinations/taiwan",
        popular: true,
      },
      {
        code: "VN",
        name: "Việt Nam",
        slug: "vietnam",
        href: "/destinations/vietnam",
        popular: true,
      },
      {
        code: "CN",
        name: "Trung Quốc",
        slug: "china",
        href: "/destinations/china",
        popular: true,
      },
      {
        code: "IN",
        name: "Ấn Độ",
        slug: "india",
        href: "/destinations/india",
        popular: true,
      },
    ],
  },
  {
    key: "europe",
    title: "Châu Âu",
    slug: "europe",
    href: "/destinations?continent=europe",
    totalLabel: "Xem tất cả (40+)",
    countries: [
      {
        code: "FR",
        name: "Pháp",
        slug: "france",
        href: "/destinations/france",
        popular: true,
      },
      {
        code: "DE",
        name: "Đức",
        slug: "germany",
        href: "/destinations/germany",
        popular: true,
      },
      {
        code: "GB",
        name: "Anh",
        slug: "united-kingdom",
        href: "/destinations/united-kingdom",
        popular: true,
      },
      {
        code: "IT",
        name: "Ý",
        slug: "italy",
        href: "/destinations/italy",
        popular: true,
      },
      {
        code: "ES",
        name: "Tây Ban Nha",
        slug: "spain",
        href: "/destinations/spain",
        popular: true,
      },
      {
        code: "NL",
        name: "Hà Lan",
        slug: "netherlands",
        href: "/destinations/netherlands",
        popular: true,
      },
      {
        code: "CH",
        name: "Thụy Sĩ",
        slug: "switzerland",
        href: "/destinations/switzerland",
        popular: true,
      },
      {
        code: "TR",
        name: "Thổ Nhĩ Kỳ",
        slug: "turkey",
        href: "/destinations/turkey",
        popular: true,
      },
    ],
  },
  {
    key: "north-america",
    title: "Bắc Mỹ",
    slug: "north-america",
    href: "/destinations?continent=north-america",
    totalLabel: "Xem tất cả (10+)",
    countries: [
      {
        code: "US",
        name: "Mỹ",
        slug: "united-states",
        href: "/destinations/united-states",
        popular: true,
      },
      {
        code: "CA",
        name: "Canada",
        slug: "canada",
        href: "/destinations/canada",
        popular: true,
      },
      {
        code: "MX",
        name: "Mexico",
        slug: "mexico",
        href: "/destinations/mexico",
        popular: true,
      },
      {
        code: "GL",
        name: "Greenland",
        slug: "greenland",
        href: "/destinations/greenland",
        popular: true,
      },
    ],
  },
  {
    key: "south-america",
    title: "Nam Mỹ",
    slug: "south-america",
    href: "/destinations?continent=south-america",
    totalLabel: "Xem tất cả (15+)",
    countries: [
      {
        code: "BR",
        name: "Brazil",
        slug: "brazil",
        href: "/destinations/brazil",
        popular: true,
      },
      {
        code: "AR",
        name: "Argentina",
        slug: "argentina",
        href: "/destinations/argentina",
        popular: true,
      },
      {
        code: "CL",
        name: "Chile",
        slug: "chile",
        href: "/destinations/chile",
        popular: true,
      },
      {
        code: "PE",
        name: "Peru",
        slug: "peru",
        href: "/destinations/peru",
        popular: true,
      },
      {
        code: "CO",
        name: "Colombia",
        slug: "colombia",
        href: "/destinations/colombia",
        popular: true,
      },
    ],
  },
  {
    key: "africa",
    title: "Châu Phi",
    slug: "africa",
    href: "/destinations?continent=africa",
    totalLabel: "Xem tất cả (20+)",
    countries: [
      {
        code: "EG",
        name: "Ai Cập",
        slug: "egypt",
        href: "/destinations/egypt",
        popular: true,
      },
      {
        code: "ZA",
        name: "Nam Phi",
        slug: "south-africa",
        href: "/destinations/south-africa",
        popular: true,
      },
      {
        code: "MA",
        name: "Morocco",
        slug: "morocco",
        href: "/destinations/morocco",
        popular: true,
      },
      {
        code: "KE",
        name: "Kenya",
        slug: "kenya",
        href: "/destinations/kenya",
        popular: true,
      },
      {
        code: "TZ",
        name: "Tanzania",
        slug: "tanzania",
        href: "/destinations/tanzania",
        popular: true,
      },
    ],
  },
  {
    key: "oceania",
    title: "Châu Đại Dương",
    slug: "oceania",
    href: "/destinations?continent=oceania",
    totalLabel: "Xem tất cả (10+)",
    countries: [
      {
        code: "AU",
        name: "Úc",
        slug: "australia",
        href: "/destinations/australia",
        popular: true,
      },
      {
        code: "NZ",
        name: "New Zealand",
        slug: "new-zealand",
        href: "/destinations/new-zealand",
        popular: true,
      },
      {
        code: "FJ",
        name: "Fiji",
        slug: "fiji",
        href: "/destinations/fiji",
        popular: true,
      },
      {
        code: "PG",
        name: "Papua New Guinea",
        slug: "papua-new-guinea",
        href: "/destinations/papua-new-guinea",
        popular: true,
      },
    ],
  },
];

export const esimSpecialDestinations: EsimSpecialDestination[] = [
  {
    id: "antarctica",
    title: "Nam Cực",
    href: "/destinations/antarctica",
  },
  {
    id: "cruise",
    title: "Tàu biển (Cruise)",
    href: "/destinations/cruise",
  },
  {
    id: "global",
    title: "eSIM Toàn cầu",
    href: "/esim?category=global",
  },
];

export const regionalCatalogEmptyState: EsimCatalogEmptyState = {
  eyebrow: "eSIM Khu vực",
  title: "Các gói eSIM khu vực đang được cập nhật",
  description:
    "Kết nối thuận tiện tại nhiều quốc gia trong cùng một hành trình. Các gói Đông Nam Á, Châu Á và Châu Âu sẽ sớm được bổ sung.",
  action: {
    label: "Xem eSIM Quốc gia",
    targetCategory: "country",
  },
};

export const globalCatalogEmptyState: EsimCatalogEmptyState = {
  eyebrow: "eSIM Toàn cầu",
  title: "Các gói eSIM toàn cầu đang được cập nhật",
  description:
    "Một gói duy nhất cho nhiều quốc gia và vùng lãnh thổ. YSim đang hoàn thiện danh mục sản phẩm để phục vụ các hành trình dài ngày và nhiều điểm đến.",
  action: {
    label: "Khám phá điểm đến",
    href: "/destinations",
  },
};