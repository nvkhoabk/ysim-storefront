import Image from "next/image";
import Link from "next/link";
import {
  Globe2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const contactItems = [
  {
    label:
      "Tầng 5, Tòa nhà Ladeco, 266 Đội Cấn, Ba Đình, Hà Nội, Việt Nam",
    href: "https://maps.google.com/?q=266+Đội+Cấn+Ba+Đình+Hà+Nội",
    icon: MapPin,
    external: true,
  },
  {
    label: "info@ysim.vn",
    href: "mailto:info@ysim.vn",
    icon: Mail,
    external: false,
  },
  {
    label: "024 9999 7777",
    href: "tel:+842499997777",
    icon: Phone,
    external: false,
  },
  {
    label: "www.ysim.vn",
    href: "https://www.ysim.vn",
    icon: Globe2,
    external: true,
  },
];

export function FooterBrand() {
  return (
    <div>
      <Link
        href="/"
        aria-label="YSim - Trang chủ"
        className="
          inline-block
          rounded-md
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-green-600
          focus-visible:ring-offset-2
        "
      >
        <Image
          src="/images/brand/ysim-logo.png"
          alt="YSim - Kết nối mọi hành trình"
          width={220}
          height={82}
          className="h-auto w-[180px] object-contain sm:w-[200px]"
        />
      </Link>

      <p className="mt-5 max-w-[330px] text-[13px] leading-6 text-slate-600">
        YSim là nền tảng eSIM toàn cầu giúp bạn kết nối Internet
        nhanh chóng, ổn định và tiện lợi tại hơn 200 quốc gia và
        vùng lãnh thổ.
      </p>

      <address className="mt-6 space-y-3.5 not-italic">
        {contactItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={
                item.external
                  ? "noreferrer noopener"
                  : undefined
              }
              className="
                group
                flex
                max-w-[350px]
                items-start
                gap-3
                text-[13px]
                leading-5
                text-slate-700
                transition
                hover:text-green-700
              "
            >
              <Icon
                aria-hidden="true"
                className="
                  mt-0.5
                  h-[18px]
                  w-[18px]
                  shrink-0
                  text-green-700
                "
                strokeWidth={1.8}
              />

              <span>{item.label}</span>
            </a>
          );
        })}
      </address>
    </div>
  );
}