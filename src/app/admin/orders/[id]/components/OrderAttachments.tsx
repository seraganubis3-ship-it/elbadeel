import { useState } from 'react';
import Link from 'next/link';
import { Order } from '../types';
import { AttachmentModal } from '@/app/admin/create/components/modals/AttachmentModal';

interface OrderAttachmentsProps {
  order: Order;
  onUpload: (name: string, file: File | null) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;
  onRemoveAttached: (index: number) => Promise<void>;
}

export default function OrderAttachments({ order, onUpload, onDelete, onRemoveAttached }: OrderAttachmentsProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className='bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 p-8'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-50'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>المستندات والمرفقات</h2>
            <p className='text-slate-500 font-bold text-lg'>الأصول والمرفقات الرقمية</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className='flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-black shadow-lg shadow-purple-100'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          إضافة مستند
        </button>
      </div>

      <div className='space-y-8'>
        {order.originalDocuments && (
          <div className='group p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='w-2 h-2 bg-indigo-500 rounded-full'></span>
              <h3 className='font-black text-slate-800 text-lg uppercase tracking-wider'>أصل المستندات المرفقة</h3>
            </div>
            <p className='text-xl font-bold text-slate-700 leading-relaxed pr-4'>{order.originalDocuments}</p>
          </div>
        )}

        <div className='group p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white transition-all duration-300'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-slate-400 rounded-full'></span>
              <h3 className='font-black text-slate-800 text-lg uppercase tracking-wider'>حالة المرفقات</h3>
            </div>
            <span
              className={`px-6 py-2 rounded-xl text-lg font-black ${
                order.hasAttachments ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
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
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
                    <h3 className='font-black text-slate-800 text-lg uppercase tracking-wider'>المستندات المرفقة</h3>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {docs.map((doc: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-purple-200 transition-colors group/att'
                      >
                        <span className='text-xl font-black text-slate-900 tracking-tight'>{doc}</span>
                        <button
                          onClick={() => onRemoveAttached(index)}
                          className='w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover/att:opacity-100'
                          title='حذف المرفق'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
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
        {((order.documents && order.documents.length > 0) || (order.orderDocuments && order.orderDocuments.length > 0)) && (
          <div className='mt-8 pt-8 border-t border-slate-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' />
                </svg>
              </div>
              <h3 className='text-xl font-black text-slate-800'>المستندات المرفوعة رقمياً</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {[...(order.documents || []), ...(order.orderDocuments || [])].map(doc => {
                const isImage = doc.fileType?.startsWith('image/');
                const isOrderDoc = 'documentType' in doc;

                return (
                  <div key={doc.id} className='group/doc border border-slate-200 rounded-3xl p-5 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 relative'>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => onDelete(doc.id)}
                      className='absolute top-3 left-3 w-10 h-10 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/doc:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10'
                      title='حذف المستند'
                    >
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                      </svg>
                    </button>

                    {isImage ? (
                      <div className='mb-4 overflow-hidden rounded-2xl border border-slate-100'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={doc.filePath} 
                          alt={doc.fileName} 
                          className='w-full h-56 object-cover group-hover/doc:scale-105 transition-transform duration-700'
                        />
                      </div>
                    ) : (
                      <div className='mb-4 h-56 bg-slate-50 flex items-center justify-center rounded-2xl border border-dashed border-slate-200'>
                        <span className='text-6xl'>📄</span>
                      </div>
                    )}
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 pr-2'>
                        <p className='font-black text-slate-900 text-lg truncate' title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className='text-sm text-slate-400 font-bold'>
                          {isOrderDoc && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] ml-2">طلب</span>}
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <Link
                        href={doc.filePath}
                        target='_blank'
                        className='px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all'
                      >
                        {isImage ? 'عرض' : 'تحميل'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AttachmentModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={async (name, file) => {
          await onUpload(name, file);
          setShowUploadModal(false);
        }}
      />
    </div>
  );
}
