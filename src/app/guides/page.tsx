import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { travelGuides } from "@/data/travel-guides";

export const metadata = {
  title: "Cẩm nang du lịch",
  description:
    "Kiến thức, hướng dẫn và kinh nghiệm sử dụng eSIM dành cho khách du lịch.",
};

export default function GuidesPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[65vh] bg-slate-50 px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <BookOpen className="h-5 w-5" />
            </span>

            <div>
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                Cẩm nang du lịch
              </h1>

              <p className="mt-2 text-slate-600">
                Hướng dẫn và kinh nghiệm giúp bạn kết nối thuận tiện trong mỗi
                chuyến đi.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {travelGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="
                      (max-width: 767px) 100vw,
                      (max-width: 1023px) 50vw,
                      33vw
                    "
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                    {guide.category}
                  </span>

                  <h2 className="mt-3 text-lg leading-6 font-bold text-slate-950">
                    {guide.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {guide.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                    Đọc bài viết
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
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
