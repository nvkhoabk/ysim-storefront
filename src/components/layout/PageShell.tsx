import {
  type ReactNode,
} from "react";

import {
  storefrontFooter,
  type StorefrontFooterConfig,
} from "@/config/storefront-footer";

import {
  storefrontNavigation,
  type StorefrontNavigationConfig,
} from "@/config/storefront-navigation";

import {
  cn,
} from "@/lib/ui/cn";

import {
  Footer,
  Header,
} from "@/components/navigation";

import {
  Container,
} from "./Container";

export interface PageShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  aside?: ReactNode;
  headerConfig?: StorefrontNavigationConfig;
  footerConfig?: StorefrontFooterConfig;
  cartCount?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  mainClassName?: string;
  contentClassName?: string;
  sidebarClassName?: string;
  asideClassName?: string;
}

export function PageShell({
  children,
  sidebar,
  aside,
  headerConfig = storefrontNavigation,
  footerConfig = storefrontFooter,
  cartCount = 0,
  showHeader = true,
  showFooter = true,
  mainClassName,
  contentClassName,
  sidebarClassName,
  asideClassName,
}: PageShellProps) {
  const hasAuxiliaryColumns =
    Boolean(sidebar || aside);

  const gridClassName =
    sidebar && aside
      ? "xl:grid-cols-[16rem_minmax(0,1fr)_18rem]"
      : sidebar
        ? "lg:grid-cols-[16rem_minmax(0,1fr)]"
        : aside
          ? "lg:grid-cols-[minmax(0,1fr)_18rem]"
          : "";

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[var(--ysim-z-toast)] -translate-y-24 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-900)] px-4 py-2 text-sm font-bold text-white shadow-[var(--ysim-shadow-md)] transition-transform focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>

      {showHeader ? (
        <Header
          config={headerConfig}
          cartCount={cartCount}
        />
      ) : null}

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "min-h-[55vh]",
          mainClassName,
        )}
      >
        {hasAuxiliaryColumns ? (
          <Container
            size="wide"
            className={cn(
              "grid gap-6 py-8 lg:gap-8",
              gridClassName,
              contentClassName,
            )}
          >
            {sidebar ? (
              <aside
                aria-label="Điều hướng phụ"
                className={cn(
                  "min-w-0",
                  sidebarClassName,
                )}
              >
                {sidebar}
              </aside>
            ) : null}

            <div className="min-w-0">
              {children}
            </div>

            {aside ? (
              <aside
                aria-label="Thông tin bổ sung"
                className={cn(
                  "min-w-0",
                  asideClassName,
                )}
              >
                {aside}
              </aside>
            ) : null}
          </Container>
        ) : (
          children
        )}
      </main>

      {showFooter ? (
        <Footer
          config={footerConfig}
        />
      ) : null}
    </>
  );
}
