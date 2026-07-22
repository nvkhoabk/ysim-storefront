"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  ChevronRight,
  CircleAlert,
  Database,
  Globe2,
  LoaderCircle,
  PackageCheck,
  ShoppingCart,
  Signal,
  Wifi,
} from "lucide-react";

import {
  Container,
  PageShell,
  Section,
  SectionHeader,
} from "@/components/layout";

import {
  Price,
} from "@/components/ui";

import {
  useWooCommerceCart,
} from "@/features/cart/refactor";

import {
  createInitialProductVariantSelection,
  createProductDetailVariantMatrix,
  findSelectedProductVariation,
  isProductVariantOptionAvailable,
  reconcileProductVariantSelection,
} from "@/lib/storefront/integration/product-detail/product-detail-variant-matrix";

import type {
  ProductDetailCartSelection,
  ProductDetailRouteCandidateViewModel,
} from "@/types/view-models/product-detail-route-candidate";

import {
  cn,
} from "@/lib/ui/cn";

import {
  ProductDetailCandidateGallery,
} from "./ProductDetailCandidateGallery";

export function ProductDetailCandidateClient({
  candidate,
  showDiagnostics = true,
  diagnostics,
}: {
  candidate:
    ProductDetailRouteCandidateViewModel;
  showDiagnostics?: boolean;
  diagnostics?:
    React.ReactNode;
}) {
  const product =
    candidate.product;

  const cartState =
    useWooCommerceCart();

  const matrix =
    useMemo(
      () =>
        createProductDetailVariantMatrix(
          product.variations,
        ),
      [
        product.variations,
      ],
    );

  const [
    selection,
    setSelection,
  ] =
    useState<
      Readonly<
        Record<string, string>
      >
    >(
      () =>
        createInitialProductVariantSelection({
          variations:
            product.variations,
          defaultVariationId:
            product.defaultVariationId,
          dimensions:
            matrix.primaryDimensions,
        }),
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string | undefined
    >();

  const selected =
    useMemo(
      () =>
        findSelectedProductVariation(
          product.variations,
          selection,
        ) ||
        product.variations[0],
      [
        product.variations,
        selection,
      ],
    );

  const canAdd =
    Boolean(
      selected &&
      selected.purchasable &&
      selected.inStock &&
      product.purchasable &&
      product.inStock,
    );

  function chooseOption(
    dimensionKey: string,
    optionValue: string,
  ) {
    setFeedback(
      undefined,
    );

    setSelection(
      (current) =>
        reconcileProductVariantSelection({
          variations:
            product.variations,
          dimensions:
            matrix.primaryDimensions,
          selection: {
            ...current,
            [
              dimensionKey
            ]:
              optionValue,
          },
          changedDimensionKey:
            dimensionKey,
        }),
    );
  }

  async function addCandidateSelection() {
    if (
      !selected ||
      !canAdd
    ) {
      setFeedback(
        "Cặp dung lượng và số ngày này hiện không thể thêm vào giỏ.",
      );
      return;
    }

    const cartSelection:
      ProductDetailCartSelection = {
        productId:
          product.id,
        productSlug:
          product.slug,
        productName:
          product.name,
        variationId:
          selected.id,
        variationSku:
          selected.sku,
        quantity,
        unitPrice:
          selected.price,
        imageUrl:
          selected.imageUrl ||
          product.gallery[0]
            ?.src ||
          "/assets/products/esim-product-placeholder.webp",
        attributes:
          selected.attributes,
      };

    window.sessionStorage.setItem(
      "ysim-product-candidate-selection",
      JSON.stringify(
        cartSelection,
      ),
    );

    try {
      await cartState.add({
        productId:
          product.id,
        variationId:
          selected.id !==
          product.id
            ? selected.id
            : undefined,
        quantity,
        variation:
          Object.entries(
            selected.attributes,
          ).map(
            (
              [
                attribute,
                value,
              ],
            ) => ({
              attribute,
              value,
            }),
          ),
      });

      window.dispatchEvent(
        new CustomEvent(
          "ysim:product-candidate:add-to-cart",
          {
            detail:
              cartSelection,
          },
        ),
      );

      setFeedback(
        `Đã thêm ${selected.label} vào giỏ hàng.`,
      );
    } catch (
      caught
    ) {
      setFeedback(
        caught instanceof
          Error
          ? caught.message
          : "Không thể thêm variation vào giỏ hàng.",
      );
    }
  }

  return (
    <PageShell
      cartCount={
        cartState.cart
          ?.items_count ||
        0
      }
    >
      <Section
        variant="subtle"
        spacing="sm"
      >
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--ysim-color-text-muted)]"
          >
            <Link
              href="/"
              className="hover:text-[var(--ysim-color-brand-700)]"
            >
              Trang chủ
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href="/destinations"
              className="hover:text-[var(--ysim-color-brand-700)]"
            >
              Điểm đến
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="text-[var(--ysim-color-text)]">
              {
                product.destinationName ||
                product.name
              }
            </span>
          </nav>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
            <ProductDetailCandidateGallery
              images={
                product.gallery
              }
            />

            <div className="lg:sticky lg:top-28">
              {product.destinationName ? (
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--ysim-color-brand-700)]">
                  {
                    product.destinationName
                  }
                </p>
              ) : null}

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--ysim-color-text)] sm:text-4xl">
                {
                  product.name
                }
              </h1>

              <p className="mt-2 text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                SKU:{" "}
                {
                  selected?.sku ||
                  product.sku ||
                  "—"
                }
              </p>

              <p className="mt-4 text-base leading-relaxed text-[var(--ysim-color-text-muted)]">
                {
                  product.shortDescription
                }
              </p>

              <div className="mt-6 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--ysim-color-text)]">
                      Chọn gói
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                      Chọn dung lượng và số ngày phù hợp.
                    </p>
                  </div>

                  <span className="rounded-[var(--ysim-radius-pill)] bg-[var(--ysim-color-brand-50)] px-3 py-1 text-xs font-bold text-[var(--ysim-color-brand-800)]">
                    {
                      product.variations.length
                    } lựa chọn
                  </span>
                </div>

                {matrix.primaryDimensions.length >
                0 ? (
                  <div className="mt-5 space-y-5">
                    {matrix.primaryDimensions.map(
                      (dimension) => (
                        <fieldset
                          key={
                            dimension.key
                          }
                        >
                          <legend className="text-sm font-bold text-[var(--ysim-color-text)]">
                            {
                              dimension.label
                            }
                          </legend>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {dimension.options.map(
                              (option) => {
                                const active =
                                  selection[
                                    dimension.key
                                  ] ===
                                  option.value;

                                const available =
                                  isProductVariantOptionAvailable({
                                    variations:
                                      product.variations,
                                    selection,
                                    dimensionKey:
                                      dimension.key,
                                    optionValue:
                                      option.value,
                                  });

                                return (
                                  <button
                                    key={
                                      option.value
                                    }
                                    type="button"
                                    aria-pressed={
                                      active
                                    }
                                    disabled={
                                      !available
                                    }
                                    onClick={() =>
                                      chooseOption(
                                        dimension.key,
                                        option.value,
                                      )
                                    }
                                    className={cn(
                                      "min-h-11 rounded-[var(--ysim-radius-md)] border px-4 py-2 text-sm font-bold transition",
                                      active
                                        ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-50)] text-[var(--ysim-color-brand-900)] ring-1 ring-[var(--ysim-color-brand-700)]"
                                        : "border-[var(--ysim-color-border-strong)] bg-white text-[var(--ysim-color-text)] hover:border-[var(--ysim-color-brand-500)]",
                                      !available
                                        ? "cursor-not-allowed border-dashed bg-slate-50 text-slate-400 opacity-60"
                                        : "",
                                    )}
                                  >
                                    {
                                      option.label
                                    }
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </fieldset>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-4 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-4 py-3 text-sm font-semibold text-[var(--ysim-color-text-muted)]">
                    Sản phẩm này có một cấu hình duy nhất.
                  </p>
                )}

                {selected ? (
                  <div className="mt-5 rounded-[var(--ysim-radius-lg)] bg-[var(--ysim-color-surface-subtle)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                          Cặp đã chọn
                        </p>

                        <p className="mt-1 font-bold text-[var(--ysim-color-text)]">
                          {
                            selected.label
                          }
                        </p>

                        {!selected.inStock ||
                        !selected.purchasable ? (
                          <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700">
                            <CircleAlert className="h-3.5 w-3.5" />
                            Tạm hết hàng
                          </p>
                        ) : (
                          <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--ysim-color-brand-700)]">
                            <Check className="h-3.5 w-3.5" />
                            Có thể mua
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                          Giá
                        </p>

                        <Price
                          amount={
                            selected.price
                          }
                          originalAmount={
                            selected.regularPrice
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {selected ? (
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--ysim-color-border)] pt-5">
                    <div>
                      <p className="text-xs font-semibold text-[var(--ysim-color-text-soft)]">
                        Tổng tiền
                      </p>

                      <Price
                        amount={
                          selected.price *
                          quantity
                        }
                        originalAmount={
                          selected.regularPrice
                            ? selected.regularPrice *
                              quantity
                            : undefined
                        }
                      />
                    </div>

                    <label>
                      <span className="mb-1 block text-xs font-bold text-[var(--ysim-color-text-muted)]">
                        Số lượng
                      </span>

                      <select
                        value={
                          quantity
                        }
                        onChange={(
                          event,
                        ) =>
                          setQuantity(
                            Number(
                              event.target.value,
                            ),
                          )
                        }
                        className="min-h-11 rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3 text-sm font-bold"
                      >
                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                        ].map(
                          (value) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {
                                value
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={
                    !canAdd ||
                    cartState.pending ===
                      "add"
                  }
                  onClick={() =>
                    void addCandidateSelection()
                  }
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 text-base font-bold text-white hover:bg-[var(--ysim-color-brand-800)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {
                    cartState.pending ===
                    "add"
                      ? (
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                        )
                      : (
                          <ShoppingCart className="h-5 w-5" />
                        )
                  }
                  {
                    cartState.pending ===
                    "add"
                      ? "Đang thêm..."
                      : "Thêm vào giỏ"
                  }
                </button>

                {feedback ? (
                  <p
                    aria-live="polite"
                    className="mt-3 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-50)] px-3 py-2 text-sm font-semibold text-[var(--ysim-color-brand-900)]"
                  >
                    {feedback}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <p className="flex items-start gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-3 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                  <PackageCheck className="h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />
                  Nhận eSIM qua email
                </p>

                <p className="flex items-start gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-surface-subtle)] px-3 py-3 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                  <Wifi className="h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />
                  Cài đặt bằng QR
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="subtle">
        <Container>
          <SectionHeader
            eyebrow="Thông tin gói"
            title="Chi tiết eSIM"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map(
              (
                feature,
                index,
              ) => {
                const icons = [
                  Database,
                  Signal,
                  Globe2,
                ];

                const Icon =
                  icons[
                    index %
                    icons.length
                  ];

                return (
                  <article
                    key={
                      feature.id
                    }
                    className="rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white p-5"
                  >
                    <Icon className="h-5 w-5 text-[var(--ysim-color-brand-700)]" />

                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--ysim-color-text-soft)]">
                      {
                        feature.label
                      }
                    </p>

                    <p className="mt-1 font-bold text-[var(--ysim-color-text)]">
                      {
                        feature.value
                      }
                    </p>
                  </article>
                );
              },
            )}
          </div>

          {product.description ? (
            <div className="mt-6 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-6">
              <h2 className="text-xl font-bold text-[var(--ysim-color-text)]">
                Mô tả
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--ysim-color-text-muted)]">
                {
                  product.description
                }
              </p>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Lưu ý sử dụng"
            title="Chuẩn bị trước chuyến đi"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {product.usageNotes.map(
              (note) => (
                <p
                  key={
                    note
                  }
                  className="flex items-start gap-3 rounded-[var(--ysim-radius-lg)] border border-[var(--ysim-color-border)] bg-white px-4 py-4 text-sm font-semibold leading-relaxed text-[var(--ysim-color-text-muted)]"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ysim-color-brand-700)]" />
                  {note}
                </p>
              ),
            )}
          </div>
        </Container>
      </Section>

      {product.relatedProducts
        .length >
      0 ? (
        <Section variant="subtle">
          <Container>
            <SectionHeader
              eyebrow="Gợi ý"
              title="Gói eSIM liên quan"
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {product.relatedProducts.map(
                (item) => (
                  <Link
                    key={
                      item.id
                    }
                    href={
                      `/ui-preview/esim-route-candidate/${item.slug}`
                    }
                    className="group overflow-hidden rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white shadow-[var(--ysim-shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--ysim-shadow-card-hover)]"
                  >
                    <div className="relative aspect-[4/3] bg-[var(--ysim-color-surface-subtle)]">
                      <Image
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.imageAlt
                        }
                        fill
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-[var(--ysim-color-text)] group-hover:text-[var(--ysim-color-brand-700)]">
                        {
                          item.name
                        }
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ysim-color-text-muted)]">
                        {item.dataLabel ? (
                          <span>
                            {
                              item.dataLabel
                            }
                          </span>
                        ) : null}

                        {item.durationLabel ? (
                          <span>
                            {
                              item.durationLabel
                            }
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <Price
                          amount={
                            item.price
                          }
                          originalAmount={
                            item.regularPrice
                          }
                          size="compact"
                        />
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </Container>
        </Section>
      ) : null}

      {showDiagnostics
        ? diagnostics
        : null}
    </PageShell>
  );
}
