'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ImageInfo {
  name: string;
  exists: boolean;
  size?: number;
  lastModified?: string;
  path?: string;
  alternative?: boolean;
}

const ImageManagementPage: React.FC = () => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const imageList = useMemo(
    () => [
      'passports.jpg',
      'government-services-bg.png',
      'official-documents.jpg',
      'national-id.jpg',
      'egyptian-foreign-affairs.jpg',
    ],
    []
  );

  const checkAllImages = useCallback(async () => {
    setLoading(true);
    try {
      const promises = imageList.map(async imageName => {
        const response = await fetch(`/api/images/check?name=${imageName}`);
        const data = await response.json();
        return { name: imageName, ...data };
      });

      const results = await Promise.all(promises);
      setImages(results);
    } catch (error) {
      //
      toast.error('خطأ في فحص الصور');
    } finally {
      setLoading(false);
    }
  }, [imageList]);

  useEffect(() => {
    checkAllImages();
  }, [checkAllImages]);

  const createPlaceholder = async (imageName: string) => {
    try {
      const response = await fetch('/api/images/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageName,
          width: 400,
          height: 300,
          color: '#059669',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`تم إنشاء صورة بديلة: ${imageName}`);
        checkAllImages();
      } else {
        toast.error('خطأ في إنشاء الصورة البديلة');
      }
    } catch (error) {
      //
      toast.error('خطأ في إنشاء الصورة البديلة');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
              <div className='space-y-4'>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className='h-16 bg-gray-200 rounded'></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h1 className='text-2xl font-bold text-gray-900'>إدارة الصور</h1>
            <p className='text-gray-600 mt-2'>فحص وإدارة الصور المفقودة في الموقع</p>
          </div>

          <div className='p-6'>
            <div className='mb-6'>
              <button
                onClick={checkAllImages}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                إعادة فحص الصور
              </button>
            </div>

            <div className='grid gap-4'>
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    image.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>{image.name}</h3>
                      <div className='text-sm text-gray-600 mt-1'>
                        {image.exists ? (
                          <div>
                            <span className='text-green-600'>✓ موجود</span>
                            {image.alternative && (
                              <span className='text-yellow-600 ml-2'>(امتداد بديل)</span>
                            )}
                            {image.size && (
                              <span className='ml-2'>• {formatFileSize(image.size)}</span>
                            )}
                            {image.lastModified && (
                              <span className='ml-2'>• {formatDate(image.lastModified)}</span>
                            )}
                          </div>
                        ) : (
                          <span className='text-red-600'>✗ مفقود</span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      {image.exists ? (
                        <div className='flex items-center space-x-2'>
                          <Image
                            src={image.path || ''}
                            alt={image.name}
                            width={64}
                            height={48}
                            className='object-cover rounded border'
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <a
                            href={image.path}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 text-sm'
                          >
                            عرض
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => createPlaceholder(image.name)}
                          className='bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors'
                        >
                          إنشاء صورة بديلة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
              <h3 className='font-semibold text-blue-900 mb-2'>ملاحظات:</h3>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• الصور الخضراء موجودة وتعمل بشكل صحيح</li>
                <li>• الصور الحمراء مفقودة وتحتاج إلى إنشاء صورة بديلة</li>
                <li>• يمكن إنشاء صور بديلة تلقائياً بالنقر على &quot;إنشاء صورة بديلة&quot;</li>
                <li>• الصور البديلة ستكون SVG مع نص وصفي</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManagementPage;
