import "../globals.css";
import { Providers } from "./providers";
import { bahij, neulis } from "@/lib/fonts";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale === "ar" ? "ar" : "en";
  const title = locale === "ar" 
    ? "HIS Future Talents — الدورة 3 | فضاء الرعاية والشراكات" 
    : "HIS Future Talents — 3rd Edition | Exhibitor & Sponsoring Portal";
  const description = locale === "ar"
    ? "اربطوا مؤسستكم بنخبة الكفاءات في الجزائر. اكتشفوا باقات الرعاية والظهور في صالون المهن والتكنولوجيا الخاص بنا."
    : "Partner your brand with Algeria's premier private higher education recruitment and training fair. Discover our sponsorship packages.";
  
  return {
    metadataBase: new URL("https://futuretalents.his.edu.dz"),
    title,
    description,
    icons: {
      icon: [
        { url: "/brand/Future Talents Symbol Logo- Orange-03.svg?v=3", type: "image/svg+xml" },
        { url: "/icon.svg?v=3", type: "image/svg+xml" },
        { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
        { url: "/favicon.ico?v=3", sizes: "any" },
      ],
      shortcut: "/brand/Future Talents Symbol Logo- Orange-03.svg?v=3",
      apple: [
        { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
        { url: "/brand/Future Talents Symbol Logo- Orange-03.svg?v=3" },
      ],
    },
    alternates: {
      canonical: `https://futuretalents.his.edu.dz/${locale}`,
      languages: {
        en: "https://futuretalents.his.edu.dz/en",
        ar: "https://futuretalents.his.edu.dz/ar",
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_DZ" : "en_US",
      type: "website",
      images: [
        {
          url: "/icon.png?v=3",
          width: 512,
          height: 512,
          alt: "HIS Future Talents Icon",
        },
      ],
    },
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/brand/Future%20Talents%20Symbol%20Logo-%20Orange-03.svg?v=3" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=3" />
        <link rel="alternate icon" type="image/png" href="/favicon-32x32.png?v=3" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('ethereum') !== -1 || e.message.indexOf('selectedAddress') !== -1)) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1577939054081916');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1577939054081916&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${neulis.variable} ${bahij.variable} bg-white text-slate-900`}>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
