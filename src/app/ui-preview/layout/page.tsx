import Link from "next/link";

import {
  AnnouncementBar,
} from "@/components/layout/AnnouncementBar";

import {
  Header,
} from "@/components/layout/Header";

import {
  Footer,
} from "@/components/layout/footer/Footer";

import {
  FooterBenefits,
} from "@/components/layout/FooterBenefits";

import {
  PageHero,
} from "@/components/layout/hero/PageHero";

import {
  SidebarNavigation,
} from "@/components/layout/navigation/SidebarNavigation";

import {
  CtaAside,
} from "@/components/layout/aside/CtaAside";

import {
  PageSection,
} from "@/components/layout/primitives";

import {
  PageShell,
} from "@/components/layout/PageShell";

export default function LayoutPreviewPage() {

  return (

    <>

      <AnnouncementBar />

      <Header />

      <PageHero

        breadcrumbs={[

          {
            label:"Trang chủ",

            href:"/",
          },

          {
            label:"UI Preview",
          },
        ]}

        eyebrow="YSim Design System"

        title="Landing Page Layout"

        description="Đây là trang dùng để kiểm thử toàn bộ Layout Framework trước khi triển khai eSIM, Destination, Handbook và Instruction."

        actions={

          <>

            <Link

              href="/"

              className="rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow-sm"

            >

              Về trang chủ

            </Link>

            <button

              className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white"

            >

              CTA Secondary

            </button>

          </>

        }

      />

      <PageSection>

        <PageShell

          sidebar={

            <SidebarNavigation

              title="Điều hướng"

              description="Ví dụ Sidebar"

              items={[

                {

                  label:"eSIM",

                  href:"#",

                  active:true,

                },

                {

                  label:"Destination",

                  href:"#",

                },

                {

                  label:"Handbook",

                  href:"#",

                },

                {

                  label:"Instruction",

                  href:"#",

                },

                {

                  label:"Support",

                  href:"#",

                },

              ]}

            />

          }

          aside={

            <CtaAside

              eyebrow="Need Help?"

              title="YSim Support"

              description="Sau này vị trí này sẽ hiển thị Illustration chính thức."

              primaryAction={{

                label:"Chat ngay",

                href:"#",

              }}

              secondaryAction={{

                label:"Xem FAQ",

                href:"#",

              }}

            />

          }

        >

          <div className="space-y-8">

            <section>

              <h2 className="text-3xl font-bold">

                Nội dung Landing Page

              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                Đây là khu vực Content.

                Sau này eSIM, Destination,

                Handbook và Instruction

                đều thay nội dung tại đây.

              </p>

            </section>

            <section className="rounded-2xl border border-slate-200 p-8">

              <h3 className="text-xl font-semibold">

                Section Example

              </h3>

              <p className="mt-4 text-slate-600">

                Có thể thay bằng

                Product Grid,

                Guide Grid,

                FAQ,

                Search,

                Destination...

              </p>

            </section>

            <section className="rounded-2xl border border-slate-200 p-8">

              <h3 className="text-xl font-semibold">

                Responsive Test

              </h3>

              <p className="mt-4 text-slate-600">

                Trên Mobile,

                Sidebar,

                Content,

                CTA

                sẽ tự xuống một cột.

              </p>

            </section>

          </div>

        </PageShell>

      </PageSection>

      <FooterBenefits />

      <Footer />

    </>

  );

}