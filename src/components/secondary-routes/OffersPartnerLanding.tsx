"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Award,
  BarChart3,
  Check,
  CreditCard,
  Gem,
  Gift,
  GraduationCap,
  Headphones,
  Megaphone,
  Plane,
  ShieldCheck,
  Smartphone,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";

import styles from "./OffersPartnerLanding.module.css";

type OffersTab =
  | "discount-policy"
  | "sales-reward"
  | "special-offers"
  | "settlement"
  | "terms";

const tabs:
  readonly {
    id:
      OffersTab;
    label: string;
    placeholderTitle?: string;
    placeholderDescription?: string;
  }[] = [
    {
      id:
        "discount-policy",
      label:
        "Chính sách chiết khấu",
    },
    {
      id:
        "sales-reward",
      label:
        "Thưởng doanh số",
      placeholderTitle:
        "Chương trình thưởng doanh số",
      placeholderDescription:
        "Cơ chế tính thưởng, chu kỳ đối soát và mốc doanh số sẽ được bổ sung trong package nội dung tiếp theo.",
    },
    {
      id:
        "special-offers",
      label:
        "Ưu đãi đặc biệt",
      placeholderTitle:
        "Ưu đãi đặc biệt dành cho đối tác",
      placeholderDescription:
        "Các chiến dịch ưu đãi theo mùa, theo thị trường và theo nhóm sản phẩm đang được hoàn thiện.",
    },
    {
      id:
        "settlement",
      label:
        "Quy đổi & thanh toán",
      placeholderTitle:
        "Quy đổi và thanh toán",
      placeholderDescription:
        "Quy tắc quy đổi, lịch thanh toán và phương thức đối soát sẽ được bổ sung sau khi chính sách tài chính được duyệt.",
    },
    {
      id:
        "terms",
      label:
        "Điều khoản",
      placeholderTitle:
        "Điều khoản chương trình đối tác",
      placeholderDescription:
        "Nội dung điều khoản sẽ được phát hành sau khi hoàn tất vòng rà soát pháp lý và vận hành.",
    },
  ];

const heroBenefits = [
  {
    icon:
      Tag,
    title:
      "Chiết khấu cao",
    description:
      "Biên lợi nhuận hấp dẫn",
  },
  {
    icon:
      BarChart3,
    title:
      "Tăng trưởng bền vững",
    description:
      "Càng bán nhiều, ưu đãi càng cao",
  },
  {
    icon:
      Gift,
    title:
      "Thưởng hấp dẫn",
    description:
      "Thưởng doanh số và chương trình đặc biệt",
  },
  {
    icon:
      Headphones,
    title:
      "Hỗ trợ toàn diện",
    description:
      "Đồng hành cùng đối tác 24/7",
  },
] as const;

const tiers = [
  {
    id:
      "silver",
    name:
      "SILVER",
    subtitle:
      "Khởi đầu linh hoạt",
    discount:
      "30%",
    requirement:
      "Không yêu cầu",
    accent:
      "#475569",
    border:
      "#dbe4ee",
    background:
      "#f8fafc",
    iconBackground:
      "#e2e8f0",
    icon:
      ShieldCheck,
    benefits: [
      "Website White Label cơ bản",
      "Hỗ trợ kỹ thuật 24/7",
      "Cập nhật sản phẩm thường xuyên",
    ],
  },
  {
    id:
      "gold",
    name:
      "GOLD",
    subtitle:
      "Tăng trưởng nhanh",
    discount:
      "40%",
    requirement:
      "≥ 200 SIM/tháng",
    accent:
      "#b45309",
    border:
      "#fcd34d",
    background:
      "#fffbeb",
    iconBackground:
      "#fef3c7",
    icon:
      Award,
    benefits: [
      "Website White Label nâng cao",
      "Hỗ trợ ưu tiên",
      "Thưởng doanh số hàng tháng",
    ],
  },
  {
    id:
      "diamond",
    name:
      "DIAMOND",
    subtitle:
      "Đối tác chiến lược",
    discount:
      "55%",
    requirement:
      "≥ 1.000 SIM/tháng",
    accent:
      "#07883d",
    border:
      "#86efac",
    background:
      "#f0fdf4",
    iconBackground:
      "#dcfce7",
    icon:
      Gem,
    benefits: [
      "API chuyên sâu & tích hợp riêng",
      "Account Manager riêng",
      "Thưởng doanh số cao + ưu đãi đặc biệt",
    ],
  },
] as const;

const partnerBenefits = [
  {
    icon:
      Headphones,
    title:
      "Hỗ trợ marketing",
    description:
      "Tài liệu, banner và công cụ hỗ trợ bán hàng",
  },
  {
    icon:
      GraduationCap,
    title:
      "Đào tạo miễn phí",
    description:
      "Hướng dẫn sản phẩm và kỹ năng bán hàng",
  },
  {
    icon:
      Megaphone,
    title:
      "Chương trình đại lý",
    description:
      "Nhiều chương trình ưu đãi theo từng thời kỳ",
  },
  {
    icon:
      ShieldCheck,
    title:
      "Minh bạch & rõ ràng",
    description:
      "Chính sách minh bạch, thanh toán nhanh chóng",
  },
  {
    icon:
      Users,
    title:
      "Đồng hành phát triển",
    description:
      "Cùng đối tác phát triển thị trường bền vững",
  },
] as const;

function DiscountPolicy() {
  return (
    <>
      <header>
        <h2
          className={
            styles.sectionTitle
          }
        >
          Chính sách chiết khấu theo hạng đối tác
        </h2>

        <p
          className={
            styles.sectionDescription
          }
        >
          Càng nâng hạng – Càng hưởng ưu đãi cao.
        </p>
      </header>

      <div
        className={
          styles.tierGrid
        }
      >
        {
          tiers.map(
            (
              tier,
            ) => {
              const Icon =
                tier.icon;

              return (
                <article
                  key={
                    tier.id
                  }
                  className={
                    styles.tier
                  }
                  style={{
                    "--tier-accent":
                      tier.accent,
                    "--tier-border":
                      tier.border,
                    "--tier-background":
                      tier.background,
                    "--tier-icon-background":
                      tier.iconBackground,
                  } as React.CSSProperties}
                >
                  <header
                    className={
                      styles.tierHeader
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={
                        styles.tierIcon
                      }
                    >
                      <Icon className="h-6 w-6" />
                    </span>

                    <div>
                      <h3
                        className={
                          styles.tierName
                        }
                      >
                        {
                          tier.name
                        }
                      </h3>

                      <p
                        className={
                          styles.tierSubtitle
                        }
                      >
                        {
                          tier.subtitle
                        }
                      </p>
                    </div>
                  </header>

                  <div
                    className={
                      styles.tierMetric
                    }
                  >
                    <div
                      className={
                        styles.metricColumn
                      }
                    >
                      <p
                        className={
                          styles.tierMetricLabel
                        }
                      >
                        Chiết khấu
                      </p>

                      <p
                        className={
                          styles.tierDiscount
                        }
                      >
                        {
                          tier.discount
                        }
                      </p>
                    </div>

                    <div
                      className={
                        styles.metricColumn
                      }
                    >
                      <p
                        className={
                          styles.tierMetricLabel
                        }
                      >
                        Yêu cầu doanh số
                      </p>

                      <p
                        className={
                          styles.tierRequirement
                        }
                      >
                        {
                          tier.requirement
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.tierBenefits
                    }
                  >
                    <p
                      className={
                        styles.tierBenefitsTitle
                      }
                    >
                      Ưu đãi khác
                    </p>

                    <ul
                      className={
                        styles.tierBenefitList
                      }
                    >
                      {
                        tier.benefits.map(
                          (
                            benefit,
                          ) => (
                            <li
                              key={
                                benefit
                              }
                              className={
                                styles.tierBenefit
                              }
                            >
                              <Check
                                aria-hidden="true"
                                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                              />

                              {
                                benefit
                              }
                            </li>
                          ),
                        )
                      }
                    </ul>
                  </div>
                </article>
              );
            },
          )
        }
      </div>

      <div
        className={
          styles.partnerBenefits
        }
      >
        {
          partnerBenefits.map(
            (
              benefit,
            ) => {
              const Icon =
                benefit.icon;

              return (
                <article
                  key={
                    benefit.title
                  }
                  className={
                    styles.partnerBenefit
                  }
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-6 w-6 ${styles.partnerBenefitIcon}`}
                  />

                  <div>
                    <h3
                      className={
                        styles.partnerBenefitTitle
                      }
                    >
                      {
                        benefit.title
                      }
                    </h3>

                    <p
                      className={
                        styles.partnerBenefitDescription
                      }
                    >
                      {
                        benefit.description
                      }
                    </p>
                  </div>
                </article>
              );
            },
          )
        }
      </div>
    </>
  );
}

function DeferredTab({
  tab,
}: {
  tab:
    (typeof tabs)[number];
}) {
  return (
    <div
      className={
        styles.placeholder
      }
    >
      <div>
        <span
          aria-hidden="true"
          className={
            styles.placeholderIcon
          }
        >
          <Gift className="h-7 w-7" />
        </span>

        <h2
          className={
            styles.placeholderTitle
          }
        >
          {
            tab.placeholderTitle
          }
        </h2>

        <p
          className={
            styles.placeholderDescription
          }
        >
          {
            tab.placeholderDescription
          }
        </p>
      </div>
    </div>
  );
}

export function OffersPartnerLanding() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      OffersTab
    >(
      "discount-policy",
    );

  const selectedTab =
    tabs.find(
      (tab) =>
        tab.id ===
        activeTab,
    ) ||
    tabs[0];

  return (
    <div>
      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroGrid
          }
        >
          <div>
            <nav
              aria-label="Breadcrumb"
              className={
                styles.breadcrumb
              }
            >
              <Link href="/">
                Trang chủ
              </Link>

              <span aria-hidden="true">
                /
              </span>

              <span>
                Ưu đãi
              </span>
            </nav>

            <h1
              className={
                styles.heroTitle
              }
            >
              Ưu đãi hấp dẫn
              <br />
              – Cùng bạn{" "}
              <span
                className={
                  styles.heroTitleAccent
                }
              >
                phát triển
              </span>
            </h1>

            <p
              className={
                styles.heroDescription
              }
            >
              Chính sách ưu đãi cạnh tranh, minh bạch và linh hoạt giúp đối tác tối ưu lợi nhuận và phát triển bền vững.
            </p>

            <div
              className={
                styles.heroBenefits
              }
            >
              {
                heroBenefits.map(
                  (
                    benefit,
                  ) => {
                    const Icon =
                      benefit.icon;

                    return (
                      <article
                        key={
                          benefit.title
                        }
                        className={
                          styles.heroBenefit
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={
                            styles.heroBenefitIcon
                          }
                        >
                          <Icon className="h-6 w-6" />
                        </span>

                        <h2
                          className={
                            styles.heroBenefitTitle
                          }
                        >
                          {
                            benefit.title
                          }
                        </h2>

                        <p
                          className={
                            styles.heroBenefitDescription
                          }
                        >
                          {
                            benefit.description
                          }
                        </p>
                      </article>
                    );
                  },
                )
              }
            </div>
          </div>

          <div
            aria-label="Minh họa tăng trưởng kinh doanh eSIM"
            className={
              styles.visual
            }
          >
            <div
              className={
                styles.visualLabel
              }
            >
              Kết nối toàn cầu, mở rộng doanh số cùng YSim
            </div>

            <Plane
              aria-hidden="true"
              className={`h-11 w-11 ${styles.plane}`}
            />

            <div
              aria-hidden="true"
              className={
                styles.travelBag
              }
            />

            <div
              aria-hidden="true"
              className={
                styles.phone
              }
            >
              <span
                className={
                  styles.phoneLogo
                }
              >
                YSIM
              </span>

              <TrendingUp
                className={`h-16 w-16 ${styles.phoneTrend}`}
              />
            </div>
          </div>

          <aside
            aria-label="Điểm nổi bật chương trình đối tác"
            className={
              styles.metricCards
            }
          >
            <article
              className={
                styles.metricCard
              }
            >
              <p
                className={
                  styles.metricLabel
                }
              >
                Chiết khấu lên đến
              </p>

              <p
                className={
                  styles.metricValue
                }
              >
                55%
              </p>

              <p
                className={
                  styles.metricDescription
                }
              >
                Tùy theo hạng đối tác
              </p>
            </article>

            <article
              className={
                styles.metricIconCard
              }
            >
              <span
                aria-hidden="true"
                className={
                  styles.metricIcon
                }
              >
                <Gift className="h-5 w-5" />
              </span>

              <div>
                <h2
                  className={
                    styles.metricLabel
                  }
                >
                  Thưởng doanh số
                </h2>

                <p
                  className={
                    styles.metricDescription
                  }
                >
                  Thưởng doanh số hấp dẫn
                </p>
              </div>
            </article>

            <article
              className={
                styles.metricIconCard
              }
            >
              <span
                aria-hidden="true"
                className={
                  styles.metricIcon
                }
              >
                <CreditCard className="h-5 w-5" />
              </span>

              <div>
                <h2
                  className={
                    styles.metricLabel
                  }
                >
                  Thanh toán nhanh
                </h2>

                <p
                  className={
                    styles.metricDescription
                  }
                >
                  Hỗ trợ linh hoạt
                </p>
              </div>
            </article>
          </aside>
        </div>

        <div
          role="tablist"
          aria-label="Nội dung chương trình ưu đãi"
          className={
            styles.tabs
          }
        >
          {
            tabs.map(
              (
                tab,
              ) => (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  role="tab"
                  aria-selected={
                    activeTab ===
                    tab.id
                  }
                  onClick={() =>
                    setActiveTab(
                      tab.id,
                    )
                  }
                  className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                >
                  {
                    tab.label
                  }
                </button>
              ),
            )
          }
        </div>
      </section>

      <section
        role="tabpanel"
        className={`mt-8 ${styles.contentCard}`}
      >
        {
          activeTab ===
          "discount-policy"
            ? (
                <DiscountPolicy />
              )
            : (
                <DeferredTab
                  tab={
                    selectedTab
                  }
                />
              )
        }
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/support"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-extrabold text-white no-underline hover:bg-emerald-800"
        >
          Trao đổi về chương trình đối tác

          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>
    </div>
  );
}
