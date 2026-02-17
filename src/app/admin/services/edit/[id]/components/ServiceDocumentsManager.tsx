'use client';

import React from 'react';
import Button from '@/components/Button';
import LogicBuilder from './LogicBuilder';
import { ServiceDocument, ServiceField } from '../types';

interface ServiceDocumentsManagerProps {
  documents: ServiceDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<ServiceDocument[]>>;
  fields?: ServiceField[];
}

export default function ServiceDocumentsManager({
  documents,
  setDocuments,
  fields = [],
}: ServiceDocumentsManagerProps) {
  const addDocument = () => {
    setDocuments(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        title: '',
        description: '',
        required: true,
        active: true,
      },
    ]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof ServiceDocument, value: string | boolean) => {
    setDocuments(prev => prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)));
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-bold text-gray-900'>المستندات المطلوبة</h3>
          <p className='text-sm text-gray-500 mt-1'>تحديد المستندات التي يجب على العميل رفعها</p>
        </div>
        <Button
          type='button'
          onClick={addDocument}
          className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center gap-2'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          إضافة مستند جديد
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 space-y-4'>
                <div>
                  <label className='block text-xs font-black text-gray-400 uppercase tracking-widest mb-2'>
                    عنوان المستند *
                  </label>
                  <input
                    type='text'
                    value={doc.title}
                    onChange={e => updateDocument(index, 'title', e.target.value)}
                    className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold'
                    placeholder='مثال: صورة البطاقة'
                  />
                </div>
                <div>
                  <label className='block text-xs font-black text-gray-400 uppercase tracking-widest mb-2'>
                    وصف أو تعليمات (اختياري)
                  </label>
                  <textarea
                    value={doc.description || ''}
                    onChange={e => updateDocument(index, 'description', e.target.value)}
                    rows={2}
                    className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm'
                    placeholder='تعليمات للعميل عند رفع المستند...'
                  />
                </div>

                {/* Logic Builder Integration */}
                <div className='pt-2 border-t border-slate-100'>
                  <LogicBuilder
                    value={doc.showIf || ''}
                    onChange={val => updateDocument(index, 'showIf', val)}
                    fields={fields.map(f => ({
                      name: f.name || `question_${f.id}`,
                      label: f.label,
                      type: f.type,
                      options: f.options?.map(o => ({ label: o.label, value: o.value })),
                    }))}
                  />
                </div>
              </div>

              <div className='flex flex-col justify-between items-end gap-4 min-w-[120px]'>
                <div className='flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100'>
                  <input
                    type='checkbox'
                    id={`req-${doc.id}`}
                    checked={doc.required}
                    onChange={e => updateDocument(index, 'required', e.target.checked)}
                    className='w-4 h-4 text-blue-600 rounded cursor-pointer'
                  />
                  <label
                    htmlFor={`req-${doc.id}`}
                    className='text-sm font-bold text-gray-700 cursor-pointer'
                  >
                    إجباري
                  </label>
                </div>

                <button
                  type='button'
                  onClick={() => removeDocument(index)}
                  className='text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors'
                  title='حذف المستند'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className='text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200'>
            <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
              <svg
                className='w-8 h-8 text-gray-400'
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
            <p className='text-gray-500 font-bold'>لا يوجد مستندات مطلوبة حالياً</p>
            <button
              type='button'
              onClick={addDocument}
              className='mt-4 text-blue-600 font-black hover:underline'
            >
              إضافة أول مستند الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
