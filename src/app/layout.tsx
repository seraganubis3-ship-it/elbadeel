import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { CrispChat } from "./page.client";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import AdminFooterWrapper from "@/components/AdminFooterWrapper";

export const metadata: Metadata = {
  title: {
    default: "خدمات استخراج الأوراق الرسمية - منصة موثوقة وسريعة | الباديل",
    template: "%s | الباديل - خدمات استخراج الأوراق الرسمية"
  },
  description: "منصة الباديل لاستخراج جميع أنواع الأوراق الرسمية باحترافية عالية. خبرة أكثر من 24 سنة في مجال الخدمات. أسعار منافسة وجودة مضمونة. اطلب الآن واحصل على خدمتك في أسرع وقت.",
  keywords: [
    "استخراج الأوراق الرسمية",
    "خدمات حكومية",
    "أوراق رسمية",
    "مستندات حكومية",
    "خدمات مصر",
    "استخراج شهادات",
    "استخراج رخص",
    "خدمات سريعة",
    "منصة موثوقة",
    "الباديل",
    "خدمات استخراج",
    "أوراق مصرية",
    "مستندات رسمية",
    "خدمات حكومية مصر",
    "استخراج أوراق"
  ],
  authors: [{ name: "الباديل", url: "https://albadil.com" }],
  creator: "الباديل",
  publisher: "الباديل",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://albadil.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/',
      'ar-EG': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://albadil.com',
    siteName: 'الباديل - خدمات استخراج الأوراق الرسمية',
    title: 'خدمات استخراج الأوراق الرسمية - منصة موثوقة وسريعة',
    description: 'منصة الباديل لاستخراج جميع أنواع الأوراق الرسمية باحترافية عالية. خبرة أكثر من 24 سنة في مجال الخدمات.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'الباديل - خدمات استخراج الأوراق الرسمية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'خدمات استخراج الأوراق الرسمية - الباديل',
    description: 'منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'خدمات حكومية',
  classification: 'خدمات استخراج الأوراق الرسمية',
  other: {
    'geo.region': 'EG',
    'geo.placename': 'مصر',
    'geo.position': '30.0444;31.2357',
    'ICBM': '30.0444, 31.2357',
    'DC.title': 'خدمات استخراج الأوراق الرسمية - الباديل',
    'DC.creator': 'الباديل',
    'DC.subject': 'خدمات حكومية، استخراج أوراق، مستندات رسمية',
    'DC.description': 'منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية',
    'DC.publisher': 'الباديل',
    'DC.contributor': 'الباديل',
    'DC.date': '2024',
    'DC.type': 'خدمات',
    'DC.format': 'موقع إلكتروني',
    'DC.identifier': 'https://albadil.com',
    'DC.language': 'ar',
    'DC.coverage': 'مصر',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "الباديل",
              "alternateName": "منصة البديل",
              "description": "منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية",
              "url": "https://albadil.com",
              "logo": "https://albadil.com/logo.jpg",
              "foundingDate": "2000",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "فيصل",
                "addressRegion": "جيزة",
                "addressCountry": "EG"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+20-10-2160-6893",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className="antialiased min-h-screen font-sans">
        <Providers>
          <AdminLayoutWrapper>
            <main className="w-full">
              {children}
            </main>
            
            <CrispChat />
          </AdminLayoutWrapper>
          
          <AdminFooterWrapper>
            <div></div>
          </AdminFooterWrapper>
        </Providers>
      </body>
    </html>
  );
}
