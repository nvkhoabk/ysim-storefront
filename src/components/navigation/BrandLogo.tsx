// F07A-2B_R2_FUNCTIONAL_SHELL_LOCALIZATION_R3

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/ui/cn";

export interface BrandLogoProps {
  href?: string;
  label?: string;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  href = "/",
  label = "YSim",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center rounded-[var(--ysim-radius-sm)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--ysim-color-focus)_25%,transparent)] focus-visible:outline-none",
        className,
      )}
    >
      <Image
        src="/assets/brand/ysim-logo.png"
        alt="YSim"
        width={126}
        height={40}
        priority={priority}
        className="h-8 w-auto sm:h-9"
      />
    </Link>
  );
}
