import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  Smartphone,
} from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Kiểm tra thiết bị hỗ trợ eSIM",
  description:
    "Kiểm tra điện thoại của bạn có hỗ trợ eSIM trước khi mua.",
};

export default function DeviceCheckPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[65vh] bg-slate-50 px-5 py-12 sm:px-6 lg:px-8">
        <div
          className="
            mx-auto
            max-w-2xl
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-7
            shadow-sm
            sm:p-10
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-green-50
              text-green-700
            "
          >
            <Smartphone className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-center text-3xl font-bold text-slate-950">
            Kiểm tra thiết bị hỗ trợ eSIM
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-center leading-7 text-slate-600">
            Nhập tên hoặc model điện thoại để kiểm tra thiết bị
            có hỗ trợ eSIM hay không.
          </p>

          <div className="relative mt-7">
            <Search
              aria-hidden="true"
              className="
                absolute
                left-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              placeholder="Ví dụ: iPhone 15 Pro, Samsung S24..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                pl-12
                pr-4
                text-sm
                outline-none
                transition
                focus:border-green-600
                focus:ring-2
                focus:ring-green-100
              "
            />
          </div>

          <div className="mt-6 rounded-2xl bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Công cụ đang được hoàn thiện
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Danh sách thiết bị hỗ trợ eSIM sẽ được bổ sung
                  trong bước tiếp theo.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-green-700
              hover:text-green-800
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Trở về trang chủ
          </Link>
        </div>
      </main>
    </>
  );
}