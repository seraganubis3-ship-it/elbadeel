import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import AdminFooterWrapper from '@/components/AdminFooterWrapper';
import AIChatWidget from '@/components/AIChatWidget';

export const metadata: Metadata = {
  metadataBase: new URL('https://albadel.com.eg'),
  title: {
    default: 'البديل لاستخراج الاوراق الحكومية',
    template: '%s | البديل',
  },
  description:
    'مكتب البديل بمصر - استخراج بطاقة رقم قومي، جواز سفر، فيش وقيد عائلي. بسرعة وأمان.',
  keywords: [
    'البديل للخدمات الحكومية',
    'مكتب البديل',
    'استخراج بطاقة رقم قومي',
    'تجديد بطاقة رقم قومي',
    'استخراج جواز سفر',
    'تجديد جواز سفر',
    'استخراج فيش جنائي',
    'تجديد فيش جنائي',
    'استخراج قيد عائلي',
    'تجديد قيد عائلي',
    'تصديق المستندات',
    'خدمات حكومية مصر',
    'مكتب خدمات حكومية الجيزة',
    'مكتب خدمات حكومية فيصل',
    'أوراق رسمية',
    'مستندات حكومية',
    'خدمات الحكومة المصرية',
    'إجراءات حكومية',
    'معاملات حكومية',
    'سعر استخراج بطاقة رقم قومي',
    'سعر استخراج جواز سفر',
    'استخراج أوراق بدون زحام',
    'مكتب تخليص معاملات',
    'خدمات حكومية أونلاين',
    'منصة خدمات حكومية',
  ],
  authors: [{ name: 'البديل', url: 'https://albadel.com.eg' }],
  creator: 'البديل',
  publisher: 'البديل',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'البديل',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://albadel.com.eg',
    languages: {
      ar: 'https://albadel.com.eg',
      'ar-EG': 'https://albadel.com.eg',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://albadel.com.eg',
    siteName: 'البديل للخدمات الحكومية',
    title: 'البديل للخدمات | بطاقة وحكوميات',
    description:
      'مكتب البديل بمصر - استخراج بطاقة رقم قومي، جواز سفر، فيش وقيد عائلي. بسرعة وأمان.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'البديل للخدمات الحكومية - مكتب موثوق لاستخراج الأوراق الرسمية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'البديل للخدمات | بطاقة وحكوميات',
    description:
      'مكتب البديل بمصر - استخراج بطاقة رقم قومي، جواز سفر، فيش وقيد عائلي. بسرعة وأمان.',
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
    google: 'koDjEJPIQLr8pn6D6kB38eWHm0tv-jSJNqR_popxUJc',
  },
  category: 'Government Services',
  other: {
    'geo.region': 'EG',
    'geo.placename': 'مصر',
    'geo.position': '30.0444;31.2357',
    ICBM: '30.0444, 31.2357',
    'DC.title': 'البديل للخدمات الحكومية - منصة موثوقة وسريعة للخدمات الحكومية',
    'DC.creator': 'البديل',
    'DC.subject': 'خدمات حكومية، استخراج أوراق رسمية، بطاقة رقم قومي، جواز سفر، فيش جنائي',
    'DC.description':
      'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج جميع الأوراق الرسمية والخدمات الحكومية في مصر',
    'DC.publisher': 'البديل',
    'DC.contributor': 'البديل',
    'DC.date': '2024',
    'DC.type': 'WebApplication',
    'DC.format': 'text/html',
    'DC.identifier': 'https://albadel.com.eg',
    'DC.language': 'ar',
    'DC.coverage': 'مصر، الجيزة، فيصل',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getCachedSettings = unstable_cache(
  async () => {
    return await prisma.systemSettings.findFirst();
  },
  ['system-settings'],
  { revalidate: 3600, tags: ['settings'] } // Cache for 1 hour, tag for on-demand revalidation if needed
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedSettings();

  return (
    <html lang='ar' dir='rtl' suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3824774678944117"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        {/* Placeholder: Google Analytics - Replace G-XXXXXXXXXX with your Tracking ID */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-V3JP54J3FG`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V3JP54J3FG');
          `}
        </Script>

        {/* Placeholder: Facebook Pixel - Replace YOUR_PIXEL_ID */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID');
            fbq('track', 'PageView');
          `}
        </Script>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: settings?.siteName || 'البديل',
              alternateName: 'البديل للخدمات الحكومية',
              legalName: 'البديل للخدمات الحكومية',
              description:
                settings?.siteDescription ||
                'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية والخدمات الحكومية في مصر',
              url: 'https://albadel.com.eg',
              logo: 'https://albadel.com.eg/logo.jpg',
              foundingDate: '2000',
              areaServed: 'EG',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'فيصل',
                addressRegion: 'جيزة',
                addressCountry: 'EG',
                streetAddress: 'فيصل، الجيزة',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: settings?.contactPhone || '+20-10-2160-6893',
                contactType: 'customer service',
                availableLanguage: ['Arabic'],
              },
              sameAs: [
                'https://x.com/YourXProfile',
                'https://instagram.com/YourInstagram',
                'https://youtube.com/YourYouTube',
                'https://linkedin.com/company/YourLinkedIn'
              ],
              priceRange: '$$',
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                  'Saturday',
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                ],
                opens: '08:00',
                closes: '22:00',
              },
            }),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'البديل للخدمات الحكومية',
              url: 'https://albadel.com.eg',
              description:
                'مكتب البديل للخدمات الحكومية في مصر - استخراج بطاقة رقم قومي، جواز سفر، فيش جنائي، قيد عائلي وتصديق المستندات بسرعة وأمان.',
              inLanguage: 'ar',
              isAccessibleForFree: false,
              copyrightHolder: {
                '@type': 'Organization',
                name: 'البديل',
              },
            }),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'البديل للخدمات الحكومية',
              image: 'https://albadel.com.eg/logo.jpg',
              telephone: settings?.contactPhone || '+20-10-2160-6893',
              url: 'https://albadel.com.eg',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'فيصل',
                addressRegion: 'جيزة',
                addressCountry: 'EG',
                streetAddress: 'فيصل، الجيزة',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 30.0444,
                longitude: 31.2357,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                  'Saturday',
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                ],
                opens: '08:00',
                closes: '22:00',
              },
              priceRange: '$$',
            }),
          }}
        />
      </head>
      <body className='antialiased min-h-screen font-sans bg-white'>
        <Providers>
          <AdminLayoutWrapper>
            <main className='w-full'>{children}</main>
          </AdminLayoutWrapper>

          <AdminFooterWrapper settings={settings}>
            <div></div>
          </AdminFooterWrapper>

          {/* AI Chat Widget */}
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}
