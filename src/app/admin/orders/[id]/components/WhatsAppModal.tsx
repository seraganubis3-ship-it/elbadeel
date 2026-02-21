'use client';

import { useEffect, useState } from 'react';
import { Order } from '../types';

interface WhatsAppModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  message: string;
  setMessage: (val: string) => void;
  sending: boolean;
  onSend: () => void;
  selectedTemplate: string;
  setSelectedTemplate: (val: string) => void;
}

interface SavedTemplate {
  id: string;
  title: string;
  body: string;
}

export default function WhatsAppModal({
  order,
  isOpen,
  onClose,
  message,
  setMessage,
  sending,
  onSend,
  selectedTemplate,
  setSelectedTemplate,
}: WhatsAppModalProps) {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingTemplates(true);
    fetch('/api/admin/whatsapp/templates')
      .then(r => r.json())
      .then(data => {
        if (data.success) setSavedTemplates(data.templates);
      })
      .finally(() => setLoadingTemplates(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-right'>

        {/* Header */}
        <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <button onClick={onClose} className='text-white/80 hover:text-white transition-colors'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            <div className='flex items-center gap-3'>
              <div>
                <h3 className='text-white font-bold text-xl'>إرسال رسالة واتساب</h3>
                <p className='text-white/80 text-sm'>{order.customerName}</p>
              </div>
              <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>

          {/* Saved Templates */}
          <div>
            <label className='block text-gray-700 font-semibold mb-3'>رسائل جاهزة:</label>
            {loadingTemplates ? (
              <div className='flex items-center justify-center py-6 text-gray-400 text-sm gap-2'>
                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'/>
                </svg>
                جاري التحميل...
              </div>
            ) : savedTemplates.length === 0 ? (
              <div className='text-center py-5 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl'>
                <p>لا توجد رسائل جاهزة</p>
                <a
                  href='/admin/whatsapp'
                  target='_blank'
                  className='text-green-600 font-bold text-xs hover:underline mt-1 inline-block'
                >
                  أضف رسائل من إعدادات الواتساب ←
                </a>
              </div>
            ) : (
              <div className='flex flex-col gap-2 max-h-48 overflow-y-auto pl-1'>
                {savedTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setMessage(template.body);
                    }}
                    className={`text-right w-full p-3 rounded-xl border-2 text-sm transition-all ${
                      selectedTemplate === template.id
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className='font-bold text-sm'>{template.title}</div>
                    <div className='text-xs text-gray-400 truncate mt-0.5'>
                      {template.body.slice(0, 70)}{template.body.length > 70 ? '...' : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>نص الرسالة:</label>
            <textarea
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setSelectedTemplate('');
              }}
              placeholder='اكتب رسالتك هنا أو اختر قالباً جاهزاً...'
              rows={6}
              className='w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-gray-900 font-medium'
              dir='rtl'
            />
          </div>

          {/* Phone Info */}
          <div className='bg-gray-50 p-4 rounded-xl'>
            <div className='flex items-center gap-2 text-gray-600 justify-end'>
              <span className='font-bold text-gray-900'>
                {order.customerPhone && order.customerPhone !== 'unknown'
                  ? order.customerPhone
                  : order.user?.phone || 'غير محدد'}
              </span>
              <span>:سيتم الإرسال إلى </span>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 pt-0 flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-center'
          >
            إلغاء
          </button>
          <button
            onClick={onSend}
            disabled={sending || !message.trim()}
            className='flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {sending ? (
              <>
                <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'/>
                </svg>
                جاري الإرسال...
              </>
            ) : (
              <>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                </svg>
                إرسال الرسالة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
