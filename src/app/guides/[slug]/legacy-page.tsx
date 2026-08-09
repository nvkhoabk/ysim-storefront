import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { travelGuides } from "@/data/travel-guides";

interface TravelGuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return travelGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function TravelGuidePage({
  params,
}: TravelGuidePageProps) {
  const { slug } = await params;

  const guide = travelGuides.find((item) => item.slug === slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[65vh] bg-slate-50 px-5 py-10 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại cẩm nang
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/8] bg-slate-100">
              <Image
                src={guide.image}
                alt={guide.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-green-700">
                <BookOpen className="h-4 w-4" />

                <span className="text-sm font-semibold">{guide.category}</span>
              </div>

              <h1 className="mt-3 text-3xl leading-tight font-bold text-slate-950 sm:text-4xl">
                {guide.title}
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600">
                {guide.excerpt}
              </p>

              <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5 text-sm leading-7 text-slate-700">
                Nội dung chi tiết của bài viết sẽ được bổ sung trong giai đoạn
                xây dựng hệ thống nội dung và cẩm nang YSim.
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
