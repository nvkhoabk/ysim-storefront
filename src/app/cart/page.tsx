import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { CartContent } from "@/components/cart/CartContent";

export const metadata = {
  title: "Giỏ hàng",
  description: "Kiểm tra các gói eSIM trong giỏ hàng YSim.",
};

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[60vh] bg-slate-50 px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-950">
            Giỏ hàng của bạn
          </h1>

          <p className="mt-2 text-slate-600">
            Kiểm tra gói eSIM trước khi tiến hành thanh toán.
          </p>

          <CartContent />
        </div>
      </main>
    </>
  );
}