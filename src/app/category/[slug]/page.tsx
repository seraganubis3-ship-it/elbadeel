import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getB2ImageUrl } from '@/lib/imageUrl';

interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

interface ServiceDocument {
  id: string;
  title: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  variants: ServiceVariant[];
  documents: ServiceDocument[];
}

interface Category {
  id: string;
  name: string;
  services: Service[];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        include: {
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
          },
          documents: {
            where: { active: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 text-gray-900'>
      {/* Hero Section */}
      <div className='relative overflow-hidden w-full'>
        <div className='absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20'></div>
        {/* Floating elements */}
        <div className='absolute top-16 sm:top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-400/20 rounded-full blur-lg sm:blur-xl animate-pulse'></div>
        <div className='absolute top-32 sm:top-40 right-4 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-400/20 rounded-full blur-lg sm:blur-xl animate-pulse delay-1000'></div>

        <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
          <div className='text-center'>
            <div className='inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm font-medium text-gray-700 mb-6'>
              <span className='w-2 h-2 bg-green-500 rounded-full ml-2'></span>
              فئة الخدمات
            </div>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 animate-fade-in'>
              {category.name}
            </h1>
            <p className='text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4'>
              جميع خدمات {category.name} في مكان واحد مع أسعار واضحة ومواعيد محددة
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16'>
        {category.services.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            {category.services.map(service => (
              <div
                key={service.id}
                className='bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group'
              >
                {/* Service Image */}
                {(() => {
                  const imageUrl = getB2ImageUrl(service.icon);
                  return (
                    imageUrl && (
                      <div className='relative h-48 sm:h-56 overflow-hidden'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={service.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                      </div>
                    )
                  );
                })()}

                {/* Service Content */}
                <div className='p-6 sm:p-8'>
                  <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4'>
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className='text-gray-600 mb-4 sm:mb-6 line-clamp-3'>{service.description}</p>
                  )}

                  {/* Service Variants */}
                  {service.variants.length > 0 && (
                    <div className='mb-4 sm:mb-6'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                        أنواع الخدمة:
                      </h4>
                      <div className='space-y-2'>
                        {service.variants.map(variant => (
                          <div
                            key={variant.id}
                            className='flex justify-between items-center bg-gray-50 rounded-lg p-3'
                          >
                            <span className='font-medium text-gray-900'>{variant.name}</span>
                            <div className='text-left'>
                              <div className='text-lg font-bold text-green-600'>
                                {(variant.priceCents / 100).toFixed(0)} جنيه
                              </div>
                              <div className='text-xs text-gray-500'>{variant.etaDays} يوم</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {service.documents.length > 0 && (
                    <div className='mb-4 sm:mb-6'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                        المتطلبات:
                      </h4>
                      <div className='space-y-1'>
                        {service.documents.map(doc => (
                          <div key={doc.id} className='flex items-center text-sm text-gray-600'>
                            <span className='w-1.5 h-1.5 bg-blue-500 rounded-full ml-2'></span>
                            {doc.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Button */}
                  <Link
                    href={`/service/${service.slug}`}
                    className='block w-full bg-gradient-to-r from-green-600 to-blue-600 text-white text-center py-3 sm:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105'
                  >
                    اطلب الآن
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 sm:py-16'>
            <div className='w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8'>
              <svg
                className='w-12 h-12 sm:w-16 sm:h-16 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                />
              </svg>
            </div>
            <h3 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4'>
              لا توجد خدمات متاحة حالياً
            </h3>
            <p className='text-gray-600 mb-6 sm:mb-8'>لم يتم إضافة خدمات في هذه الفئة بعد</p>
            <Link
              href='/services'
              className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300'
            >
              <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
              عرض جميع الخدمات
            </Link>
          </div>
        )}

        {/* Back to Services */}
        <div className='mt-12 sm:mt-16 text-center'>
          <Link
            href='/services'
            className='inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl'
          >
            <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
            العودة لجميع الخدمات
          </Link>
        </div>
      </div>
    </div>
  );
}
