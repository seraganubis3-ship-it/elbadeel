'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  variants: ServiceVariant[];
}

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);

  // Only allow next/image when src is an absolute URL or a root-relative path
  const isValidImageSrc = (src?: string | null): src is string => {
    if (!src) return false;
    return src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
  };

  useEffect(() => {
    if (service && service.variants.length > 0) {
      setSelectedVariant(service.variants[0] || null);
    }
  }, [service]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const getBackgroundImage = (service: Service) => {
    if (
      service.icon &&
      (service.icon.startsWith('/') ||
        service.icon.startsWith('http://') ||
        service.icon.startsWith('https://'))
    ) {
      return service.icon;
    }
    return '/images/default-service-bg.jpg';
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      {/* Modal Content */}
      <div className='relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl transform transition-all duration-500'>
        {/* Header with Background Image */}
        <div className='relative h-64 sm:h-80 overflow-hidden rounded-t-3xl'>
          {isValidImageSrc(service.icon) ? (
            <Image
              src={getBackgroundImage(service)}
              alt={service.name}
              width={800}
              height={320}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 flex items-center justify-center'>
              <div className='text-center'>
                <span className='text-6xl sm:text-7xl font-bold text-white opacity-80'>
                  {service.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20'></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          {/* Service Icon and Title */}
          <div className='absolute bottom-6 left-6 right-6'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30'>
                <span className='text-3xl'>
                  {service.name.includes('شهادة') || service.name.includes('ميلاد')
                    ? '📄'
                    : service.name.includes('رخصة') || service.name.includes('قيادة')
                      ? '🚗'
                      : service.name.includes('جواز') || service.name.includes('سفر')
                        ? '📘'
                        : service.name.includes('هوية') || service.name.includes('بطاقة')
                          ? '🆔'
                          : '📋'}
                </span>
              </div>
              <div>
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2'>
                  {service.name}
                </h2>
                <p className='text-gray-200 text-sm sm:text-base'>
                  {service.description || 'خدمة مميزة لاستخراج الأوراق الرسمية بسهولة وأمان'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 sm:p-8'>
          {/* Service Variants */}
          {service.variants && service.variants.length > 0 && (
            <div className='mb-8'>
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>اختر نوع الخدمة</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {service.variants.map(variant => (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedVariant?.id === variant.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className='text-center'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-2'>{variant.name}</h4>
                      <div className='text-2xl font-bold text-emerald-600 mb-2'>
                        {(variant.priceCents / 100).toFixed(0)} ج.م
                      </div>
                      <div className='text-sm text-gray-600'>{variant.etaDays} يوم</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Features */}
          <div className='mb-8'>
            <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>مميزات الخدمة</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center gap-3 p-4 bg-emerald-50 rounded-xl'>
                <div className='w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <span className='text-gray-700 font-medium'>خدمة موثوقة ومضمونة</span>
              </div>
              <div className='flex items-center gap-3 p-4 bg-blue-50 rounded-xl'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <span className='text-gray-700 font-medium'>تسليم سريع وآمن</span>
              </div>
              <div className='flex items-center gap-3 p-4 bg-indigo-50 rounded-xl'>
                <div className='w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <span className='text-gray-700 font-medium'>دعم فني متخصص</span>
              </div>
              <div className='flex items-center gap-3 p-4 bg-purple-50 rounded-xl'>
                <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <span className='text-gray-700 font-medium'>حماية وأمان البيانات</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link
              href={`/service/${service.slug}${selectedVariant ? `?variant=${selectedVariant.id}` : ''}`}
              className='flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25'
            >
              <span>طلب الخدمة الآن</span>
              <svg className='mr-2 w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </Link>
            <button
              onClick={onClose}
              className='px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300'
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
