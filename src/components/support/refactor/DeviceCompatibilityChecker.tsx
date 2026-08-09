"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Search,
  Smartphone,
} from "lucide-react";

import {
  Container,
  Section,
  SectionHeader,
} from "@/components/layout";

import type {
  DeviceCompatibilityViewModel,
  DeviceManualCheckViewModel,
} from "@/types/view-models/support";

import {
  CompatibilityResultCard,
} from "./CompatibilityResultCard";

import {
  DeviceCheckGuide,
} from "./DeviceCheckGuide";

export interface DeviceCompatibilityCheckerProps {
  devices:
    readonly DeviceCompatibilityViewModel[];
  manualChecks:
    readonly DeviceManualCheckViewModel[];
}

export function DeviceCompatibilityChecker({
  devices,
  manualChecks,
}: DeviceCompatibilityCheckerProps) {
  const brands =
    useMemo(
      () =>
        Array.from(
          new Set(
            devices.map(
              (device) =>
                device.brand,
            ),
          ),
        ).sort(),
      [
        devices,
      ],
    );

  const [
    brand,
    setBrand,
  ] =
    useState(
      brands[0] ||
      "",
    );

  const [
    modelId,
    setModelId,
  ] =
    useState("");

  const [
    query,
    setQuery,
  ] =
    useState("");

  const visibleDevices =
    useMemo(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase();

        return devices.filter(
          (device) => {
            const matchesBrand =
              !brand ||
              device.brand ===
              brand;

            const matchesQuery =
              !normalized ||
              `${device.brand} ${device.model}`
                .toLowerCase()
                .includes(
                  normalized,
                );

            return (
              matchesBrand &&
              matchesQuery
            );
          },
        );
      },
      [
        devices,
        brand,
        query,
      ],
    );

  const selectedDevice =
    devices.find(
      (device) =>
        device.id ===
        modelId,
    );

  function changeBrand(
    nextBrand: string,
  ) {
    setBrand(
      nextBrand,
    );

    setModelId(
      "",
    );
  }

  return (
    <Section
      id="device-compatibility"
      variant="subtle"
    >
      <Container>
        <SectionHeader
          eyebrow="Kiểm tra thiết bị"
          title="Điện thoại của bạn có hỗ trợ eSIM?"
          description="Danh sách dưới đây chỉ là dữ liệu preview để kiểm tra trải nghiệm giao diện."
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-white p-5 shadow-[var(--ysim-shadow-sm)] sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
                  Hãng điện thoại
                </span>

                <select
                  value={
                    brand
                  }
                  onChange={(
                    event,
                  ) =>
                    changeBrand(
                      event.target.value,
                    )
                  }
                  className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3.5 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
                >
                  {brands.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
                  Model
                </span>

                <select
                  value={
                    modelId
                  }
                  onChange={(
                    event,
                  ) =>
                    setModelId(
                      event.target.value,
                    )
                  }
                  className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white px-3.5 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
                >
                  <option value="">
                    Chọn model
                  </option>

                  {visibleDevices.map(
                    (device) => (
                      <option
                        key={
                          device.id
                        }
                        value={
                          device.id
                        }
                      >
                        {
                          device.model
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-[var(--ysim-color-text)]">
                Tìm nhanh
              </span>

              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ysim-color-text-soft)]" />

                <input
                  value={
                    query
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Nhập tên model..."
                  className="min-h-12 w-full rounded-[var(--ysim-radius-md)] border border-[var(--ysim-color-border-strong)] bg-white pl-10 pr-3.5 text-sm font-semibold outline-none focus:border-[var(--ysim-color-brand-600)] focus:ring-4 focus:ring-[var(--ysim-color-brand-100)]"
                />
              </span>
            </label>

            <div className="mt-6">
              {selectedDevice ? (
                <CompatibilityResultCard
                  device={
                    selectedDevice
                  }
                />
              ) : (
                <div className="rounded-[var(--ysim-radius-xl)] border border-dashed border-[var(--ysim-color-border-strong)] bg-[var(--ysim-color-surface-subtle)] px-5 py-10 text-center">
                  <Smartphone className="mx-auto h-10 w-10 text-[var(--ysim-color-text-soft)]" />

                  <h3 className="mt-4 text-lg font-bold text-[var(--ysim-color-text)]">
                    Chọn thiết bị để kiểm tra
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--ysim-color-text-muted)]">
                    Kết quả sẽ hiển thị trạng thái và các lưu ý cần thiết.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DeviceCheckGuide
            steps={
              manualChecks
            }
          />
        </div>
      </Container>
    </Section>
  );
}
