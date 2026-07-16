import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string;
    key?: string;
  }>;
}

export const metadata = {
  title: "Đặt hàng thành công",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order } = await searchParams;

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[70vh] bg-slate-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-700" />

          <h1 className="mt-6 text-3xl font-bold text-slate-950">
            Đơn hàng đã được tạo
          </h1>

          {order ? (
            <p className="mt-3 text-slate-600">
              Mã đơn hàng: <strong className="text-slate-900">#{order}</strong>
            </p>
          ) : null}

          <div className="mt-8 rounded-2xl bg-green-50 p-5">
            <Mail className="mx-auto h-7 w-7 text-green-700" />

            <p className="mt-3 font-semibold text-slate-900">
              Kiểm tra email của bạn
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Thông tin thanh toán và eSIM sẽ được gửi sau khi đơn hàng được xác
              nhận.
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-green-700 px-6 text-sm font-semibold text-white hover:bg-green-800"
          >
            Trở về trang chủ
          </Link>
        </div>
      </main>
    </>
  );
}
