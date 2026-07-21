import Link from "next/link";

import {
  ArrowUpRight,
  Camera,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import {
  Container,
} from "@/components/layout";

import {
  storefrontFooter,
  type FooterLink,
  type FooterSocialIcon,
  type StorefrontFooterConfig,
} from "@/config/storefront-footer";

import {
  BrandLogo,
} from "./BrandLogo";

import {
  TrustFeatureRow,
} from "./TrustFeatureRow";

const socialIconMap:
  Record<FooterSocialIcon, LucideIcon> = {
    facebook: Users,
    instagram: Camera,
    youtube: Video,
    message: MessageCircle,
  };

function isExternalHref(
  link: FooterLink,
): boolean {
  return (
    link.external === true ||
    /^https?:\/\//.test(
      link.href,
    )
  );
}

function FooterNavLink({
  link,
}: {
  link: FooterLink;
}) {
  const content = (
    <>
      <span>
        {link.label}
      </span>

      {link.badge ? (
        <span className="rounded-[var(--ysim-radius-pill)] bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
          {link.badge}
        </span>
      ) : null}

      {isExternalHref(
        link,
      ) ? (
        <ArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      ) : null}
    </>
  );

  const className =
    "inline-flex items-center gap-2 rounded-[var(--ysim-radius-sm)] py-1 text-sm text-white/72 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20";

  if (
    isExternalHref(
      link,
    )
  ) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={className}
    >
      {content}
    </Link>
  );
}

export interface FooterProps {
  config?: StorefrontFooterConfig;
}

export function Footer({
  config = storefrontFooter,
}: FooterProps) {
  return (
    <footer>
      <TrustFeatureRow
        items={
          config.trustFeatures
        }
      />

      <div className="bg-[var(--ysim-color-brand-950)] text-white">
        <Container>
          <div className="grid gap-10 py-12 lg:grid-cols-[1.25fr_2fr] lg:gap-16 lg:py-16">
            <div>
              <div className="inline-flex rounded-[var(--ysim-radius-md)] bg-white px-3 py-2">
                <BrandLogo />
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
                {
                  config.brand
                    .description
                }
              </p>

              <div className="mt-6 space-y-3 text-sm text-white/72">
                <a
                  href={`mailto:${config.brand.supportEmail}`}
                  className="flex items-center gap-2 rounded-[var(--ysim-radius-sm)] transition-colors hover:text-white"
                >
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  {
                    config.brand
                      .supportEmail
                  }
                </a>

                <p className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  {
                    config.brand
                      .location
                  }
                </p>
              </div>

              <nav
                aria-label="Mạng xã hội"
                className="mt-7 flex flex-wrap gap-2"
              >
                {config.socialLinks.map(
                  (social) => {
                    const Icon =
                      socialIconMap[
                        social.icon
                      ];

                    const external =
                      /^https?:\/\//.test(
                        social.href,
                      );

                    const classes =
                      "inline-flex h-10 w-10 items-center justify-center rounded-[var(--ysim-radius-md)] border border-white/15 bg-white/5 text-white/80 transition-[background-color,border-color,color,transform] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white";

                    return external ? (
                      <a
                        key={
                          social.label
                        }
                        href={
                          social.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        aria-label={
                          social.label
                        }
                        className={
                          classes
                        }
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link
                        key={
                          social.label
                        }
                        href={
                          social.href
                        }
                        aria-label={
                          social.label
                        }
                        className={
                          classes
                        }
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    );
                  },
                )}
              </nav>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {config.columns.map(
                (column) => (
                  <nav
                    key={
                      column.title
                    }
                    aria-label={
                      column.title
                    }
                  >
                    <h2 className="text-sm font-bold text-white">
                      {
                        column.title
                      }
                    </h2>

                    <div className="mt-4 flex flex-col items-start gap-2">
                      {column.links.map(
                        (link) => (
                          <FooterNavLink
                            key={
                              `${link.href}-${link.label}`
                            }
                            link={link}
                          />
                        ),
                      )}
                    </div>
                  </nav>
                ),
              )}

              <section aria-labelledby="footer-apps-title">
                <h2
                  id="footer-apps-title"
                  className="text-sm font-bold text-white"
                >
                  Ứng dụng YSim
                </h2>

                <div className="mt-4 space-y-3">
                  {config.appLinks.map(
                    (app) => {
                      const Icon =
                        app.platform ===
                        "iOS"
                          ? Smartphone
                          : Download;

                      return (
                        <a
                          key={
                            app.platform
                          }
                          href={
                            app.href
                          }
                          aria-disabled={
                            app.comingSoon ||
                            undefined
                          }
                          className="flex items-center gap-3 rounded-[var(--ysim-radius-md)] border border-white/15 bg-white/5 px-3 py-2.5 text-sm transition-colors hover:border-white/30 hover:bg-white/10"
                        >
                          <Icon className="h-5 w-5 shrink-0" />

                          <span>
                            <span className="block text-[10px] uppercase tracking-wide text-white/55">
                              {app.comingSoon
                                ? "Sắp ra mắt"
                                : "Tải xuống"}
                            </span>

                            <span className="block font-semibold text-white">
                              {
                                app.label
                              }
                            </span>
                          </span>
                        </a>
                      );
                    },
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-white/10 py-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <section aria-labelledby="footer-payment-title">
                <h2
                  id="footer-payment-title"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-white/55"
                >
                  Thanh toán an toàn
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {config.paymentMethods.map(
                    (method) => (
                      <span
                        key={
                          method
                        }
                        className="inline-flex min-h-8 items-center rounded-[var(--ysim-radius-sm)] bg-white px-3 text-xs font-bold text-[var(--ysim-color-brand-950)]"
                      >
                        {method}
                      </span>
                    ),
                  )}
                </div>
              </section>

              <nav
                aria-label="Chính sách"
                className="flex flex-wrap gap-x-5 gap-y-2"
              >
                {config.legalLinks.map(
                  (link) => (
                    <FooterNavLink
                      key={
                        link.href
                      }
                      link={link}
                    />
                  ),
                )}
              </nav>
            </div>
          </div>

          <div className="border-t border-white/10 py-5 text-xs leading-relaxed text-white/55">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                {config.copyright}
              </p>

              <p className="max-w-2xl sm:text-right">
                {
                  config.securityNote
                }
              </p>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
