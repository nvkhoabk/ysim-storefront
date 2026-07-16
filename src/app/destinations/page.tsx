import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Điểm đến eSIM",
  description: "Khám phá các điểm đến eSIM quốc tế của YSim.",
};

export default function DestinationsPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[60vh] bg-slate-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-950">Điểm đến eSIM</h1>

          <p className="mt-4 text-slate-600">
            Trang danh sách điểm đến sẽ được hoàn thiện ở giai đoạn tiếp theo.
          </p>
        </div>
      </main>
    </>
  );
}
