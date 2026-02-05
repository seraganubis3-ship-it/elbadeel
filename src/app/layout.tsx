import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';
import AdminFooterWrapper from '@/components/AdminFooterWrapper';
import AIChatWidget from '@/components/AIChatWidget';

export const metadata: Metadata = {
  title: {
    default: 'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج الأوراق الرسمية',
    template: '%s | البديل للخدمات الحكومية',
  },
  description:
    'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية باحترافية عالية. خبرة أكثر من 24 سنة في مجال الخدمات الحكومية. أسعار منافسة وجودة مضمونة.',
  keywords: [
    'البديل للخدمات الحكومية',
    'استخراج الأوراق الرسمية',
    'خدمات حكومية',
    'أوراق رسمية',
    'مستندات حكومية',
    'خدمات مصر',
    'استخراج شهادات',
    'استخراج رخص',
    'خدمات سريعة',
    'منصة موثوقة',
    'البديل',
    'البديل للخدمات الحكومية',
    'منصة البديل',
    'خدمات استخراج',
    'أوراق مصرية',
    'مستندات رسمية',
    'خدمات حكومية مصر',
    'استخراج أوراق',
  ],
  authors: [{ name: 'البديل', url: 'https://albadel.com.eg' }],
  creator: 'البديل',
  publisher: 'البديل',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://albadel.com.eg'),
  alternates: {
    canonical: '/',
    languages: {
      ar: '/',
      'ar-EG': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://albadel.com.eg',
    siteName: 'البديل للخدمات الحكومية',
    title: 'البديل للخدمات الحكومية - منصة موثوقة وسريعة',
    description:
      'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'البديل للخدمات الحكومية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'البديل للخدمات الحكومية - منصة موثوقة وسريعة',
    description: 'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج الأوراق الرسمية',
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
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'خدمات حكومية',
  classification: 'البديل للخدمات الحكومية',
  other: {
    'geo.region': 'EG',
    'geo.placename': 'مصر',
    'geo.position': '30.0444;31.2357',
    ICBM: '30.0444, 31.2357',
    'DC.title': 'البديل للخدمات الحكومية - منصة موثوقة وسريعة',
    'DC.creator': 'البديل',
    'DC.subject': 'خدمات حكومية، استخراج أوراق، مستندات رسمية',
    'DC.description': 'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج الأوراق الرسمية',
    'DC.publisher': 'البديل',
    'DC.contributor': 'البديل',
    'DC.date': '2024',
    'DC.type': 'خدمات',
    'DC.format': 'موقع إلكتروني',
    'DC.identifier': 'https://albadel.com.eg',
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
    <html lang='ar' dir='rtl' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'البديل',
              alternateName: 'البديل للخدمات الحكومية',
              description:
                'البديل للخدمات الحكومية - منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية',
              url: 'https://albadel.com.eg',
              logo: 'https://albadel.com.eg/logo.jpg',
              foundingDate: '2000',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'فيصل',
                addressRegion: 'جيزة',
                addressCountry: 'EG',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+20-10-2160-6893',
              },
            }),
          }}
        />
      </head>
      <body className='antialiased min-h-screen font-sans bg-white'>
        <Providers>
          <AdminLayoutWrapper>
            <main className='w-full'>{children}</main>
          </AdminLayoutWrapper>

          <AdminFooterWrapper>
            <div></div>
          </AdminFooterWrapper>

          {/* AI Chat Widget */}
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}
