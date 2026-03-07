import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'التسجيل - البديل للخدمات الحكومية',
  description:
    'أنشئ حساباً جديداً في منصة البديل للخدمات الحكومية. سجل الآن واستفد من جميع خدماتنا المتاحة.',
  keywords: [
    'التسجيل في البديل',
    'إنشاء حساب',
    'تسجيل دخول',
    'حساب جديد',
    'منصة البديل',
    'خدمات حكومية',
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/register',
  },
  openGraph: {
    title: 'التسجيل - البديل للخدمات الحكومية',
    description:
      'أنشئ حساباً جديداً في منصة البديل للخدمات الحكومية. سجل الآن واستفد من جميع خدماتنا المتاحة.',
    url: 'https://albadel.com.eg/register',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
