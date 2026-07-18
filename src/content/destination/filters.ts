import type {
  DestinationCatalogFilterState,
  DestinationFilterDefinition,
} from "@/components/destination/catalog/types";

export const initialDestinationCatalogFilters: DestinationCatalogFilterState =
  {
    continent: "all",
    duration: "all",
    data: "all",
    sort: "popular",
  };

export const destinationCatalogFilterDefinitions: DestinationFilterDefinition[] =
  [
    {
      id: "continent",
      label: "Khu vực",
      placeholder: "Tất cả khu vực",
      options: [
        {
          value: "all",
          label: "Tất cả khu vực",
        },
        {
          value: "asia",
          label: "Châu Á",
        },
        {
          value: "europe",
          label: "Châu Âu",
        },
        {
          value: "north-america",
          label: "Bắc Mỹ",
        },
        {
          value: "south-america",
          label: "Nam Mỹ",
        },
        {
          value: "africa",
          label: "Châu Phi",
        },
        {
          value: "oceania",
          label: "Châu Đại Dương",
        },
      ],
    },
    {
      id: "duration",
      label: "Thời hạn",
      placeholder: "Mọi thời hạn",
      options: [
        {
          value: "all",
          label: "Mọi thời hạn",
        },
        {
          value: "1-7",
          label: "1 – 7 ngày",
        },
        {
          value: "8-15",
          label: "8 – 15 ngày",
        },
        {
          value: "16-30",
          label: "16 – 30 ngày",
        },
        {
          value: "31-90",
          label: "31 – 90 ngày",
        },
        {
          value: "90-plus",
          label: "Trên 90 ngày",
        },
      ],
    },
    {
      id: "data",
      label: "Dung lượng",
      placeholder: "Mọi dung lượng",
      options: [
        {
          value: "all",
          label: "Mọi dung lượng",
        },
        {
          value: "under-3gb",
          label: "Dưới 3GB",
        },
        {
          value: "3gb-10gb",
          label: "3GB – 10GB",
        },
        {
          value: "10gb-30gb",
          label: "10GB – 30GB",
        },
        {
          value: "daily",
          label: "Dung lượng theo ngày",
        },
        {
          value: "unlimited",
          label: "Không giới hạn",
        },
      ],
    },
    {
      id: "sort",
      label: "Sắp xếp",
      placeholder: "Phổ biến nhất",
      options: [
        {
          value: "popular",
          label: "Phổ biến nhất",
        },
        {
          value: "price-asc",
          label: "Giá thấp đến cao",
        },
        {
          value: "price-desc",
          label: "Giá cao đến thấp",
        },
        {
          value: "name-asc",
          label: "Tên A – Z",
        },
        {
          value: "name-desc",
          label: "Tên Z – A",
        },
      ],
    },
  ];