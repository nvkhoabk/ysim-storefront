import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { localizedAlternates, StorefrontLocaleProvider } from "@/i18n/runtime";
import { getStorefrontLocaleRequest } from "@/i18n/runtime/runtime.server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataCopy = {
  vi: {
    title: "YSim - eSIM du lịch quốc tế",
    description:
      "Mua eSIM du lịch quốc tế, nhận mã QR nhanh chóng và kết nối Internet ngay khi đến điểm đến.",
  },
  en: {
    title: "YSim - International travel eSIM",
    description:
      "Buy an international travel eSIM, receive the QR code quickly, and connect as soon as you arrive.",
  },
  lo: {
    title: "YSim - eSIM ສຳລັບການເດີນທາງຕ່າງປະເທດ",
    description:
      "ຊື້ eSIM ສຳລັບການເດີນທາງ, ຮັບລະຫັດ QR ຢ່າງວ່ອງໄວ ແລະ ເຊື່ອມຕໍ່ເມື່ອເດີນທາງຮອດ.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const request = await getStorefrontLocaleRequest();
  const copy = metadataCopy[request.shell.locale];

  return {
    title: { default: copy.title, template: "%s | YSim" },
    description: copy.description,
    alternates: localizedAlternates(request),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const request = await getStorefrontLocaleRequest();

  return (
    <html
      lang={request.shell.htmlLang}
      dir={request.shell.direction}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <StorefrontLocaleProvider shell={request.shell}>
          {children}
        </StorefrontLocaleProvider>
      </body>
    </html>
  );
}
