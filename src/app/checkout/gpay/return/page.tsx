import {
  GPayReturnClient,
} from "@/components/payment/GPayReturnClient";

import {
  AnnouncementBar,
} from "@/components/layout/AnnouncementBar";

import {
  Header,
} from "@/components/layout/Header";

export const metadata = {
  title:
    "Kết quả thanh toán GPay",

  robots: {
    index: false,
    follow: false,
  },
};

export default function GPayReturnPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-[70vh] bg-slate-50 px-6 py-16 lg:px-8">
        <GPayReturnClient />
      </main>
    </>
  );
}
