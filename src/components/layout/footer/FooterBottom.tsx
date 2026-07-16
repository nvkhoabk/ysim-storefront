import Link from "next/link";
import {
  Apple,
  ChevronDown,
  Globe2,
  Play,
  ShieldCheck,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

const paymentMethods = [
  {
    id: "visa",
    label: "VISA",
    className:
      "font-black italic tracking-tight text-blue-700",
  },
  {
    id: "mastercard",
    label: "Mastercard",
    className: "font-semibold text-orange-600",
  },
  {
    id: "apple-pay",
    label: " Pay",
    className: "font-semibold text-slate-950",
  },
  {
    id: "google-pay",
    label: "G Pay",
    className: "font-semibold text-slate-700",
  },
  {
    id: "momo",
    label: "momo",
    className: "font-bold text-pink-600",
  },
  {
    id: "zalopay",
    label: "ZaloPay",
    className: "font-semibold text-blue-600",
  },
];

interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: IconType;
}

const socialLinks: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebookF,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://youtube.com",
    icon: FaYoutube,
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://tiktok.com",
    icon: FaTiktok,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: FaLinkedinIn,
  },
];

function PaymentMethods() {
  return (
    <section aria-labelledby="footer-payment-title">
      <h2
        id="footer-payment-title"
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-wide
          text-green-700
        "
      >
        Chúng tôi chấp nhận thanh toán
      </h2>

      <div
        className="
          mt-3
          flex
          min-h-12
          flex-wrap
          items-center
          gap-x-4
          gap-y-2
          rounded-xl
          border
          border-slate-200
          bg-white/90
          px-4
          py-2.5
          shadow-sm
        "
      >
        {paymentMethods.map((method) => (
          <span
            key={method.id}
            className={`text-[12px] ${method.className}`}
          >
            {method.label}
          </span>
        ))}

        <span className="text-base font-bold leading-none text-slate-500">
          ···
        </span>
      </div>
    </section>
  );
}

function AppDownloads() {
  return (
    <section aria-labelledby="footer-app-title">
      <h2
        id="footer-app-title"
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-wide
          text-green-700
        "
      >
        Tải ứng dụng YSim
      </h2>

      <p className="mt-1 text-[10px] leading-4 text-slate-600">
        Quản lý eSIM của bạn mọi lúc, mọi nơi.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="#"
          aria-label="Tải ứng dụng YSim trên App Store"
          className="
            flex
            min-h-12
            min-w-[142px]
            items-center
            gap-2.5
            rounded-lg
            bg-slate-950
            px-3
            py-2
            text-white
            shadow-sm
            transition
            hover:bg-black
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
        >
          <Apple
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
            fill="currentColor"
          />

          <span>
            <span className="block text-[8px] leading-3">
              Download on the
            </span>

            <span className="block text-[13px] font-semibold leading-4">
              App Store
            </span>
          </span>
        </Link>

        <Link
          href="#"
          aria-label="Tải ứng dụng YSim trên Google Play"
          className="
            flex
            min-h-12
            min-w-[142px]
            items-center
            gap-2.5
            rounded-lg
            bg-slate-950
            px-3
            py-2
            text-white
            shadow-sm
            transition
            hover:bg-black
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
        >
          <Play
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
            fill="currentColor"
          />

          <span>
            <span className="block text-[8px] leading-3">
              GET IT ON
            </span>

            <span className="block text-[13px] font-semibold leading-4">
              Google Play
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

function SocialLinks() {
  return (
    <section aria-labelledby="footer-social-title">
      <h2
        id="footer-social-title"
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-wide
          text-green-700
        "
      >
        Kết nối với chúng tôi
      </h2>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {socialLinks.map((social) => {
          const Icon = social.icon;

          return (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.label}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-green-100
                bg-white
                text-green-700
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:border-green-700
                hover:bg-green-700
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
            >
              <Icon
				  aria-hidden="true"
				  className="h-4 w-4"
				/>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function FooterBottom() {
  return (
    <div className="border-t border-slate-200/80">
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-7
          px-5
          py-7
          sm:px-6
          md:grid-cols-2
          lg:grid-cols-[1.1fr_1fr_0.8fr]
          lg:px-8
        "
      >
        <PaymentMethods />
        <AppDownloads />
        <SocialLinks />
      </div>

      <div className="border-t border-slate-200/80">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-4
            px-5
            py-5
            sm:px-6
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
          "
        >
          <p className="text-[10px] leading-4 text-slate-600">
            © 2026 YSim. All rights reserved.
          </p>

          <div
            className="
              flex
              items-start
              gap-2
              text-[10px]
              leading-4
              text-slate-600
            "
          >
            <ShieldCheck
              aria-hidden="true"
              className="
                mt-0.5
                h-[18px]
                w-[18px]
                shrink-0
                text-slate-500
              "
              strokeWidth={1.7}
            />

            <span>
              Hệ thống đạt tiêu chuẩn bảo mật PCI DSS
              <br />
              và ISO/IEC 27001:2022
            </span>
          </div>

          <button
            type="button"
            aria-label="Chọn quốc gia và đơn vị tiền tệ"
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-lg
              px-2
              py-1.5
              text-[11px]
              font-medium
              text-slate-700
              transition
              hover:bg-white
              hover:text-green-700
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-green-600
              focus-visible:ring-offset-2
            "
          >
            <Globe2
              aria-hidden="true"
              className="h-4 w-4"
            />

            Việt Nam (VND)

            <ChevronDown
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}