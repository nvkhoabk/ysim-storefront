import Link from "next/link";
import { ChevronLeft, LockKeyhole } from "lucide-react";

import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Thanh toán",
  description:
    "Hoàn tất đơn hàng eSIM YSim an toàn và nhanh chóng.",
};

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen bg-slate-50 px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-green-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Quay lại giỏ hàng
              </Link>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Thanh toán
              </h1>

              <p className="mt-3 text-slate-600">
                Hoàn tất thông tin để nhận eSIM sau khi thanh toán.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LockKeyhole className="h-4 w-4 text-green-700" />
              Kết nối bảo mật
            </div>
          </div>

          <CheckoutContent />
        </div>
      </main>
    </>
  );
}