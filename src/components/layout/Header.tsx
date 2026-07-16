import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe2, Menu } from "lucide-react";

import { CartButton } from "@/components/cart/CartButton";

const navigationItems = [
  {
    label: "eSIM",
    href: "/esim",
    hasDropdown: true,
  },
  {
    label: "Điểm đến",
    href: "/destinations",
  },
  {
    label: "Hướng dẫn",
    href: "/guides",
  },
  {
    label: "Ưu đãi",
    href: "/offers",
  },
  {
    label: "Hỗ trợ",
    href: "/support",
    hasDropdown: true,
  },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Trang chủ YSim"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/brand/ysim-logo.png"
            alt="YSim"
            width={160}
            height={52}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-green-700"
            >
              {item.label}

              {item.hasDropdown ? <ChevronDown className="h-4 w-4" /> : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <Globe2 className="h-5 w-5" />
            VI
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-700"
          >
            VND
            <ChevronDown className="h-4 w-4" />
          </button>

          <CartButton />

          <Link
            href="/login"
            className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            Đăng nhập
          </Link>
        </div>

        <button
          type="button"
          aria-label="Mở menu"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
