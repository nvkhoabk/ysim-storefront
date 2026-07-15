import type { WooCommerceProductAttribute } from "@/lib/woocommerce/types";

interface ProductAttributesProps {
  attributes: WooCommerceProductAttribute[];
}

function formatAttributeName(name: string): string {
  const nameMap: Record<string, string> = {
    destination_code: "Mã điểm đến",
    duration_days: "Thời hạn sử dụng",
    data_type: "Loại dung lượng",
    data_amount: "Dung lượng",
    data_unit: "Đơn vị dung lượng",
    network: "Nhà mạng",
    activation_policy: "Chính sách kích hoạt",
    hotspot: "Chia sẻ hotspot",
    phone_number: "Số điện thoại",
  };

  return nameMap[name.toLowerCase()] ?? name;
}

function formatAttributeValue(
  attributeName: string,
  value: string,
): string {
  const normalizedName = attributeName.toLowerCase();
  const normalizedValue = value.toLowerCase();

  if (normalizedValue === "yes") {
    return "Có";
  }

  if (normalizedValue === "no") {
    return "Không";
  }

  if (
    normalizedName === "activation_policy" &&
    normalizedValue === "first-network-connection"
  ) {
    return "Khi kết nối mạng lần đầu";
  }

  if (
    normalizedName === "activation_policy" &&
    normalizedValue === "first_network_connection"
  ) {
    return "Khi kết nối mạng lần đầu";
  }

  if (normalizedName === "data_type" && normalizedValue === "daily") {
    return "Theo ngày";
  }

  if (normalizedName === "duration_days") {
    return `${value} ngày`;
  }

  return value;
}

export function ProductAttributes({
  attributes,
}: ProductAttributesProps) {
  if (attributes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Sản phẩm chưa có thuộc tính chi tiết.
      </p>
    );
  }

  return (
    <dl className="overflow-hidden rounded-2xl border border-slate-200">
      {attributes.map((attribute, index) => {
        const values = attribute.terms
          .map((term) =>
            formatAttributeValue(
              attribute.name,
              term.name || term.slug,
            ),
          )
          .join(", ");

        return (
          <div
            key={`${attribute.id}-${attribute.name}`}
            className={`grid gap-2 px-5 py-4 sm:grid-cols-[220px_1fr] ${
              index % 2 === 0 ? "bg-slate-50" : "bg-white"
            }`}
          >
            <dt className="text-sm font-semibold text-slate-700">
              {formatAttributeName(attribute.name)}
            </dt>

            <dd className="text-sm text-slate-900">
              {values || "Chưa cập nhật"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}