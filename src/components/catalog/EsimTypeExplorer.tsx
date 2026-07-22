"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Layers3,
  MapPinned,
} from "lucide-react";

import {
  esimDestinationExplorer,
} from "@/config/esim-destination-explorer";

import type {
  EsimContinentViewModel,
  EsimExplorerType,
} from "@/types/view-models/esim-destination-explorer";

import styles from "./EsimDestinationExplorer.module.css";

const flagAssetVersion =
  "7.5.0";

function countryFlagSource(
  countryCode: string,
): string {
  return (
    "https://cdn.jsdelivr.net/gh/lipis/flag-icons@" +
    `${flagAssetVersion}/flags/4x3/${countryCode.toLowerCase()}.svg`
  );
}

function ContinentGroup({
  group,
}: {
  group:
    EsimContinentViewModel;
}) {
  return (
    <section
      className={
        styles.group
      }
    >
      <h3
        className={
          styles.groupTitle
        }
      >
        {
          group.label
        }
      </h3>

      <ul
        className={
          styles.destinationList
        }
      >
        {
          group.destinations.map(
            (
              destination,
            ) => (
              <li
                key={
                  destination.slug
                }
              >
                <Link
                  href={`/destinations?destination=${encodeURIComponent(destination.slug)}`}
                  className={
                    styles.destinationLink
                  }
                >
                  <span
                    aria-hidden="true"
                    data-flag-code={
                      destination.countryCode ||
                      "special"
                    }
                    className={
                      styles.destinationFlag
                    }
                  >
                    {
                      destination.countryCode
                        ? (
                            <>
                              <span
                                className={
                                  styles.flagFallbackCode
                                }
                              >
                                {
                                  destination
                                    .countryCode
                                    .toUpperCase()
                                }
                              </span>

                              <img
                                src={
                                  countryFlagSource(
                                    destination.countryCode,
                                  )
                                }
                                alt=""
                                width="28"
                                height="21"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className={
                                  styles.flagImage
                                }
                                onError={
                                  (
                                    event,
                                  ) => {
                                    event
                                      .currentTarget
                                      .style
                                      .display =
                                      "none";
                                  }
                                }
                              />
                            </>
                          )
                        : (
                            <MapPinned
                              className={
                                styles.destinationSpecialIcon
                              }
                            />
                          )
                    }
                  </span>

                  <span
                    className={
                      styles.destinationName
                    }
                  >
                    {
                      destination.label
                    }
                  </span>
                </Link>
              </li>
            ),
          )
        }
      </ul>

      <Link
        href={`/destinations?continent=${encodeURIComponent(group.id)}`}
        className={
          styles.viewAll
        }
      >
        Xem tất cả ({
          group.countLabel
        })

        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4"
        />
      </Link>
    </section>
  );
}

function CountryPanel() {
  return (
    <>
      <h2
        className={
          styles.panelTitle
        }
      >
        Chọn eSIM theo châu lục
      </h2>

      <div
        className={
          styles.primaryGrid
        }
      >
        {
          esimDestinationExplorer
            .primaryContinents
            .map(
              (
                group,
              ) => (
                <ContinentGroup
                  key={
                    group.id
                  }
                  group={
                    group
                  }
                />
              ),
            )
        }
      </div>

      <div
        className={
          styles.secondaryGrid
        }
      >
        {
          esimDestinationExplorer
            .secondaryContinents
            .map(
              (
                group,
              ) => (
                <ContinentGroup
                  key={
                    group.id
                  }
                  group={
                    group
                  }
                />
              ),
            )
        }
      </div>
    </>
  );
}

function RegionPanel() {
  return (
    <>
      <h2
        className={
          styles.panelTitle
        }
      >
        Chọn eSIM theo khu vực
      </h2>

      <div
        className={
          styles.regionGrid
        }
      >
        {
          esimDestinationExplorer
            .regions
            .map(
              (
                region,
              ) => (
                <Link
                  key={
                    region.id
                  }
                  href={`/destinations?type=region&region=${encodeURIComponent(region.id)}`}
                  className={
                    styles.regionCard
                  }
                >
                  <span
                    className={
                      styles.regionCoverage
                    }
                  >
                    {
                      region.coverage
                    }
                  </span>

                  <span
                    className={
                      styles.regionName
                    }
                  >
                    {
                      region.label
                    }
                  </span>

                  <span
                    className={
                      styles.regionDescription
                    }
                  >
                    {
                      region.description
                    }
                  </span>

                  <span
                    className={
                      styles.regionAction
                    }
                  >
                    Xem gói khu vực

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </span>
                </Link>
              ),
            )
        }
      </div>
    </>
  );
}

function GlobalPanel() {
  return (
    <div
      className={
        styles.globalPanel
      }
    >
      <div
        className={
          styles.globalInner
        }
      >
        <span
          aria-hidden="true"
          className={
            styles.globalIcon
          }
        >
          <Globe2
            className="h-10 w-10"
          />
        </span>

        <h2
          className={
            styles.globalTitle
          }
        >
          Một eSIM cho hành trình toàn cầu
        </h2>

        <p
          className={
            styles.globalDescription
          }
        >
          Kết nối xuyên biên giới với một gói dữ liệu duy nhất, phù hợp chuyến đi dài ngày hoặc nhiều châu lục.
        </p>

        <div
          className={
            styles.globalBenefits
          }
        >
          {
            esimDestinationExplorer
              .globalBenefits
              .map(
                (
                  benefit,
                ) => (
                  <p
                    key={
                      benefit
                    }
                    className={
                      styles.globalBenefit
                    }
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    />

                    {
                      benefit
                    }
                  </p>
                ),
              )
          }
        </div>

        <Link
          href="/destinations?type=global"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-extrabold text-white no-underline hover:bg-emerald-800"
        >
          Xem eSIM Toàn cầu

          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
          />
        </Link>
      </div>
    </div>
  );
}

const typeIcons = {
  country:
    MapPinned,
  region:
    Layers3,
  global:
    Globe2,
} as const;

export function EsimTypeExplorer() {
  const [
    activeType,
    setActiveType,
  ] =
    useState<
      EsimExplorerType
    >(
      "country",
    );

  return (
    <section
      aria-label="Khám phá loại eSIM"
      className={
        styles.explorer
      }
    >
      <aside
        className={
          styles.typeColumn
        }
      >
        <h2
          className={
            styles.typeTitle
          }
        >
          Loại eSIM
        </h2>

        <div
          role="tablist"
          aria-label="Chọn loại eSIM"
          className={
            styles.typeTabs
          }
        >
          {
            esimDestinationExplorer
              .types
              .map(
                (
                  type,
                ) => {
                  const active =
                    activeType ===
                    type.id;

                  const Icon =
                    typeIcons[
                      type.id
                    ];

                  return (
                    <button
                      key={
                        type.id
                      }
                      type="button"
                      role="tab"
                      aria-selected={
                        active
                      }
                      aria-controls={`esim-panel-${type.id}`}
                      onClick={() =>
                        setActiveType(
                          type.id,
                        )
                      }
                      className={`${styles.typeTab} ${active ? styles.typeTabActive : ""}`}
                    >
                      <span
                        className={
                          styles.typeTabLabel
                        }
                      >
                        <span className="flex items-center gap-2">
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4"
                          />

                          {
                            type.label
                          }
                        </span>

                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </span>

                      <span
                        className={
                          styles.typeTabDescription
                        }
                      >
                        {
                          type.description
                        }
                      </span>
                    </button>
                  );
                },
              )
          }
        </div>

        <div
          className={
            styles.typeBenefits
          }
        >
          <p
            className={
              styles.typeBenefit
            }
          >
            Kích hoạt trong vài phút
          </p>

          <p
            className={
              styles.typeBenefit
            }
          >
            Không cần SIM vật lý
          </p>

          <p
            className={
              styles.typeBenefit
            }
          >
            Giữ nguyên số Việt Nam
          </p>

          <p
            className={
              styles.typeBenefit
            }
          >
            Hỗ trợ 24/7 tiếng Việt
          </p>
        </div>
      </aside>

      <div
        id={`esim-panel-${activeType}`}
        role="tabpanel"
        className={
          styles.mainPanel
        }
      >
        {
          activeType ===
          "country"
            ? (
                <CountryPanel />
              )
            : null
        }

        {
          activeType ===
          "region"
            ? (
                <RegionPanel />
              )
            : null
        }

        {
          activeType ===
          "global"
            ? (
                <GlobalPanel />
              )
            : null
        }
      </div>

      <aside
        className={
          styles.discoverPanel
        }
      >
        <p
          className={
            styles.discoverEyebrow
          }
        >
          eSIM cho hơn
        </p>

        <div
          className={
            styles.discoverNumber
          }
        >
          200+
        </div>

        <div
          className={
            styles.discoverTitle
          }
        >
          quốc gia &amp; vùng lãnh thổ
        </div>

        <div
          className={
            styles.discoverBenefits
          }
        >
          {
            esimDestinationExplorer
              .discoverBenefits
              .map(
                (
                  benefit,
                ) => (
                  <p
                    key={
                      benefit
                    }
                    className={
                      styles.discoverBenefit
                    }
                  >
                    {
                      benefit
                    }
                  </p>
                ),
              )
          }
        </div>

        <div
          aria-hidden="true"
          className={
            styles.globeStage
          }
        >
          <Globe2
            className="h-24 w-24"
            strokeWidth={1.25}
          />
        </div>

        <Link
          href="/destinations"
          className={
            styles.discoverCta
          }
        >
          Khám phá eSIM

          <ArrowRight
            aria-hidden="true"
            className="h-5 w-5"
          />
        </Link>
      </aside>
    </section>
  );
}
