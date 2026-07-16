import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { testimonials } from "@/data/testimonials";

export const metadata = {
  title: "Đánh giá khách hàng",
  description: "Những chia sẻ từ khách hàng đã sử dụng eSIM YSim.",
};

export default function ReviewsPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[65vh] bg-slate-50 px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            Khách hàng nói gì về YSim
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Những trải nghiệm và chia sẻ từ khách hàng đã sử dụng eSIM trong các
            chuyến đi.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                    {testimonial.initials}
                  </span>

                  <div>
                    <div className="flex items-center gap-1">
                      <h2 className="text-sm font-bold text-slate-950">
                        {testimonial.customerName}
                      </h2>

                      {testimonial.verified ? (
                        <BadgeCheck className="h-4 w-4 text-green-700" />
                      ) : null}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {testimonial.destinationFlag} {testimonial.destination}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={
                        index < testimonial.rating
                          ? "h-4 w-4 fill-amber-400 text-amber-400"
                          : "h-4 w-4 text-slate-200"
                      }
                    />
                  ))}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {testimonial.content}
                </p>
              </article>
            ))}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở về trang chủ
          </Link>
        </div>
      </main>
    </>
  );
}
