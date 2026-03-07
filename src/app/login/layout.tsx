import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - البديل للخدمات الحكومية',
  description:
    'سجل الدخول إلى حسابك في منصة البديل للخدمات الحكومية للوصول إلى جميع خدماتنا المتاحة.',
  keywords: [
    'تسجيل الدخول في البديل',
    'دخول حساب',
    'تسجيل دخول',
    'تسجيل دخول المستخدم',
    'منصة البديل',
    'خدمات حكومية',
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/login',
  },
  openGraph: {
    title: 'تسجيل الدخول - البديل للخدمات الحكومية',
    description:
      'سجل الدخول إلى حسابك في منصة البديل للخدمات الحكومية للوصول إلى جميع خدماتنا المتاحة.',
    url: 'https://albadel.com.eg/login',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
