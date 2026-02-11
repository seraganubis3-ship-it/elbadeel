'use client';

import Link from 'next/link';
import { Order } from '../types';

interface OrderAttachmentsProps {
  order: Order;
}

export default function OrderAttachments({ order }: OrderAttachmentsProps) {
  return (
    <div className='bg-white rounded-xl shadow-lg p-8 border border-gray-100'>
      <div className='flex items-center mb-6'>
        <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4'>
          <svg
            className='w-6 h-6 text-purple-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-gray-900'>المستندات والمرفقات</h2>
      </div>

      {order.originalDocuments && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>أصل المستندات المرفقة</h3>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <p className='text-gray-700'>{order.originalDocuments}</p>
          </div>
        </div>
      )}

      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>حالة المرفقات</h3>
        <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
          <span className='text-gray-700 font-medium mr-3'>المرفقات:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.hasAttachments ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.hasAttachments ? 'بمرفقات' : 'بدون مرفقات'}
          </span>
        </div>
      </div>

      {order.attachedDocuments &&
        (() => {
          try {
            const docs =
              typeof order.attachedDocuments === 'string'
                ? JSON.parse(order.attachedDocuments)
                : order.attachedDocuments;
            if (!Array.isArray(docs) || docs.length === 0) return null;
            return (
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>المستندات المرفقة</h3>
                <div className='space-y-2'>
                  {docs.map((doc: string, index: number) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <span className='text-gray-900 font-medium'>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })()}

      {/* New B2 Uploaded Documents (Document table) */}
      {order.documents && order.documents.length > 0 && (
        <div className='mt-6 border-t pt-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
            ☁️ المستندات المرفوعة (B2)
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {order.documents.map(doc => {
              const isImage = doc.fileType.startsWith('image/');
              return (
                <div key={doc.id} className='border rounded-lg p-4 bg-purple-50 border-purple-100'>
                  {isImage ? (
                    <div className='mb-3'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={doc.filePath} 
                        alt={doc.fileName} 
                        className='w-full h-48 object-cover rounded-lg border border-purple-100'
                      />
                    </div>
                  ) : null}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl'>{isImage ? '🖼️' : '📄'}</span>
                      <div>
                        <p className='font-bold text-gray-900 text-sm truncate max-w-[150px]' title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className='text-[10px] text-gray-500'>
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={doc.filePath}
                      target='_blank'
                      className='px-3 py-1.5 bg-white text-purple-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all border border-purple-100'
                    >
                      {isImage ? 'عرض كامل' : 'تحميل الملف'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
