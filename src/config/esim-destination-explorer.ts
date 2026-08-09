import type {
  EsimDestinationExplorerViewModel,
} from "@/types/view-models/esim-destination-explorer";

export const esimDestinationExplorer:
  EsimDestinationExplorerViewModel = {
    types: [
      {
        id:
          "country",
        label:
          "eSIM Quốc gia",
        description:
          "eSIM cho từng quốc gia",
      },
      {
        id:
          "region",
        label:
          "eSIM Khu vực",
        description:
          "Dùng tại nhiều quốc gia trong cùng khu vực",
      },
      {
        id:
          "global",
        label:
          "eSIM Toàn cầu",
        description:
          "Kết nối tại hơn 200 quốc gia và vùng lãnh thổ",
      },
    ],
    primaryContinents: [
      {
        id:
          "asia",
        label:
          "Châu Á",
        countLabel:
          "50+",
        destinations: [
          {
            label:
              "Nhật Bản",
            slug:
              "japan",
            countryCode:
              "jp",
          },
          {
            label:
              "Hàn Quốc",
            slug:
              "south-korea",
            countryCode:
              "kr",
          },
          {
            label:
              "Singapore",
            slug:
              "singapore",
            countryCode:
              "sg",
          },
          {
            label:
              "Thái Lan",
            slug:
              "thailand",
            countryCode:
              "th",
          },
          {
            label:
              "Đài Loan",
            slug:
              "taiwan",
            countryCode:
              "tw",
          },
          {
            label:
              "Việt Nam",
            slug:
              "vietnam",
            countryCode:
              "vn",
          },
          {
            label:
              "Trung Quốc",
            slug:
              "china",
            countryCode:
              "cn",
          },
          {
            label:
              "Ấn Độ",
            slug:
              "india",
            countryCode:
              "in",
          },
        ],
      },
      {
        id:
          "europe",
        label:
          "Châu Âu",
        countLabel:
          "40+",
        destinations: [
          {
            label:
              "Pháp",
            slug:
              "france",
            countryCode:
              "fr",
          },
          {
            label:
              "Đức",
            slug:
              "germany",
            countryCode:
              "de",
          },
          {
            label:
              "Anh",
            slug:
              "united-kingdom",
            countryCode:
              "gb",
          },
          {
            label:
              "Ý",
            slug:
              "italy",
            countryCode:
              "it",
          },
          {
            label:
              "Tây Ban Nha",
            slug:
              "spain",
            countryCode:
              "es",
          },
          {
            label:
              "Hà Lan",
            slug:
              "netherlands",
            countryCode:
              "nl",
          },
          {
            label:
              "Thụy Sĩ",
            slug:
              "switzerland",
            countryCode:
              "ch",
          },
          {
            label:
              "Thổ Nhĩ Kỳ",
            slug:
              "turkey",
            countryCode:
              "tr",
          },
        ],
      },
      {
        id:
          "north-america",
        label:
          "Bắc Mỹ",
        countLabel:
          "10+",
        destinations: [
          {
            label:
              "Mỹ",
            slug:
              "united-states",
            countryCode:
              "us",
          },
          {
            label:
              "Canada",
            slug:
              "canada",
            countryCode:
              "ca",
          },
          {
            label:
              "Mexico",
            slug:
              "mexico",
            countryCode:
              "mx",
          },
          {
            label:
              "Greenland",
            slug:
              "greenland",
            countryCode:
              "gl",
          },
        ],
      },
      {
        id:
          "south-america",
        label:
          "Nam Mỹ",
        countLabel:
          "15+",
        destinations: [
          {
            label:
              "Brazil",
            slug:
              "brazil",
            countryCode:
              "br",
          },
          {
            label:
              "Argentina",
            slug:
              "argentina",
            countryCode:
              "ar",
          },
          {
            label:
              "Chile",
            slug:
              "chile",
            countryCode:
              "cl",
          },
          {
            label:
              "Peru",
            slug:
              "peru",
            countryCode:
              "pe",
          },
          {
            label:
              "Colombia",
            slug:
              "colombia",
            countryCode:
              "co",
          },
        ],
      },
      {
        id:
          "africa",
        label:
          "Châu Phi",
        countLabel:
          "20+",
        destinations: [
          {
            label:
              "Ai Cập",
            slug:
              "egypt",
            countryCode:
              "eg",
          },
          {
            label:
              "Nam Phi",
            slug:
              "south-africa",
            countryCode:
              "za",
          },
          {
            label:
              "Morocco",
            slug:
              "morocco",
            countryCode:
              "ma",
          },
          {
            label:
              "Kenya",
            slug:
              "kenya",
            countryCode:
              "ke",
          },
          {
            label:
              "Tanzania",
            slug:
              "tanzania",
            countryCode:
              "tz",
          },
        ],
      },
    ],
    secondaryContinents: [
      {
        id:
          "oceania",
        label:
          "Châu Đại Dương",
        countLabel:
          "10+",
        destinations: [
          {
            label:
              "Úc",
            slug:
              "australia",
            countryCode:
              "au",
          },
          {
            label:
              "New Zealand",
            slug:
              "new-zealand",
            countryCode:
              "nz",
          },
          {
            label:
              "Fiji",
            slug:
              "fiji",
            countryCode:
              "fj",
          },
          {
            label:
              "Papua New Guinea",
            slug:
              "papua-new-guinea",
            countryCode:
              "pg",
          },
        ],
      },
      {
        id:
          "special",
        label:
          "Điểm đến đặc biệt",
        countLabel:
          "Khám phá",
        destinations: [
          {
            label:
              "Nam Cực",
            slug:
              "antarctica",
            countryCode:
              "aq",
          },
          {
            label:
              "Tàu biển (Cruise)",
            slug:
              "cruise",
          },
          {
            label:
              "eSIM Toàn cầu",
            slug:
              "global",
          },
        ],
      },
    ],
    regions: [
      {
        id:
          "southeast-asia",
        label:
          "Đông Nam Á",
        description:
          "Một eSIM dùng cho nhiều điểm đến phổ biến trong ASEAN.",
        coverage:
          "8+ quốc gia",
      },
      {
        id:
          "asia",
        label:
          "Châu Á",
        description:
          "Phù hợp hành trình qua nhiều quốc gia Đông Á và Nam Á.",
        coverage:
          "15+ quốc gia",
      },
      {
        id:
          "europe",
        label:
          "Châu Âu",
        description:
          "Di chuyển xuyên biên giới với một gói dữ liệu duy nhất.",
        coverage:
          "35+ quốc gia",
      },
      {
        id:
          "north-america",
        label:
          "Bắc Mỹ",
        description:
          "Kết nối tại Mỹ, Canada, Mexico và các điểm đến lân cận.",
        coverage:
          "5+ quốc gia",
      },
      {
        id:
          "latin-america",
        label:
          "Mỹ Latinh",
        description:
          "Dành cho hành trình qua Trung Mỹ và Nam Mỹ.",
        coverage:
          "15+ quốc gia",
      },
      {
        id:
          "middle-east",
        label:
          "Trung Đông",
        description:
          "Kết nối thuận tiện tại các trung tâm du lịch và công tác.",
        coverage:
          "10+ quốc gia",
      },
      {
        id:
          "africa",
        label:
          "Châu Phi",
        description:
          "Một gói dữ liệu cho nhiều điểm đến tại châu Phi.",
        coverage:
          "20+ quốc gia",
      },
    ],
    globalBenefits: [
      "Một eSIM cho hành trình qua nhiều châu lục",
      "Không phải đổi SIM khi qua biên giới",
      "Phù hợp chuyến đi dài ngày và nhiều điểm đến",
      "Quản lý dữ liệu ngay trên điện thoại",
    ],
    discoverBenefits: [
      "Kích hoạt trong vài phút",
      "Không cần SIM vật lý",
      "Giữ nguyên số Việt Nam",
      "Hỗ trợ 24/7 tiếng Việt",
    ],
  };
