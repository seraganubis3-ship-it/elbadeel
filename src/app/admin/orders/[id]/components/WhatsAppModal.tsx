'use client';

import { useEffect, useState } from 'react';
import { Order } from '../types';
import { replacePlaceholders } from '@/lib/whatsapp-utils';

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
  category: string;
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
        if (data.success) {
          // Filter only MANUAL templates for the popup
          setSavedTemplates(data.templates.filter((t: SavedTemplate) => t.category === 'MANUAL'));
        }
      })
      .finally(() => setLoadingTemplates(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: SavedTemplate) => {
    setSelectedTemplate(template.id);
    const processedBody = replacePlaceholders(template.body, order);
    setMessage(processedBody);
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6'>
      <div className='bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col text-right'>
        {/* Header */}
        <div className='bg-gradient-to-r from-emerald-500 to-green-600 p-5 sm:p-8 shrink-0'>
          <div className='flex items-center justify-between'>
            <button
              onClick={onClose}
              className='w-8 h-8 sm:w-10 sm:h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95'
            >
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='text-right'>
                <h3 className='text-white font-black text-lg sm:text-2xl tracking-tight'>
                  إرسال واتساب
                </h3>
                <p className='text-white/80 text-xs sm:text-sm font-bold'>{order.customerName}</p>
              </div>
              <div className='w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 shadow-inner'>
                <svg
                  className='w-5 h-5 sm:w-8 sm:h-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar flex-1'>
          {/* Saved Templates */}
          <div>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <a
                href='/admin/whatsapp/templates'
                target='_blank'
                className='text-emerald-600 font-black text-[10px] sm:text-xs hover:underline bg-emerald-50 px-2 py-1 rounded-lg'
              >
                إدارة القوالب ←
              </a>
              <h4 className='text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest'>
                رسائل جاهزة
              </h4>
            </div>
            {loadingTemplates ? (
              <div className='flex items-center justify-center py-8 text-slate-400 text-sm gap-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
                <div className='w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                <span className='font-bold'>جاري التحميل...</span>
              </div>
            ) : savedTemplates.length === 0 ? (
              <div className='text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl'>
                <p className='font-bold italic'>لا توجد رسائل جاهزة حالياً</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-2 sm:gap-3 max-h-40 sm:max-h-56 overflow-y-auto pl-1 custom-scrollbar'>
                {savedTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-right w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all transform active:scale-[0.99] ${
                      selectedTemplate === template.id
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-lg shadow-emerald-50'
                        : 'border-slate-50 bg-slate-50/50 hover:border-emerald-200 hover:bg-white text-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className='font-black text-sm sm:text-base mb-0.5'>{template.title}</div>
                    <div className='text-[10px] sm:text-xs text-slate-400 font-bold line-clamp-1'>
                      {template.body}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <span className='text-[10px] sm:text-xs font-bold text-slate-300'>
                {message.length} حرف
              </span>
              <h4 className='text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest'>
                نص الرسالة
              </h4>
            </div>
            <textarea
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setSelectedTemplate('');
              }}
              placeholder='اكتب رسالتك المخصصة هنا...'
              rows={4}
              className='w-full p-4 sm:p-5 border-2 border-slate-100 bg-slate-50/30 rounded-2xl sm:rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm sm:text-lg resize-none custom-scrollbar'
              dir='rtl'
            />
          </div>

          {/* Phone Info */}
          <div className='bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 text-white shadow-xl shadow-slate-200'>
            <div className='flex items-center justify-between gap-3'>
              <div className='w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0'>
                <svg
                  className='w-4 h-4 sm:w-6 sm:h-6 text-emerald-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
              </div>
              <div className='text-left flex-1'>
                <p className='text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1'>
                  رقم الهاتف المستهدف
                </p>
                <p className='text-base sm:text-xl font-black font-mono tracking-tighter'>
                  {order.customerPhone && order.customerPhone !== 'unknown'
                    ? order.customerPhone
                    : order.user?.phone || 'غير محدد'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-5 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0'>
          <button
            onClick={onSend}
            disabled={sending || !message.trim()}
            className='order-1 sm:order-2 flex-[2] px-6 sm:px-8 py-3.5 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-all font-black shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center gap-3 text-sm sm:text-base'
          >
            {sending ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <svg
                  className='w-5 h-5 sm:w-6 sm:h-6 rotate-[-45deg]'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                </svg>
                <span>إرسـال الرسـالـة</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className='order-2 sm:order-1 flex-1 px-6 sm:px-8 py-3.5 sm:py-5 bg-slate-50 text-slate-500 rounded-xl sm:rounded-2xl hover:bg-slate-100 transition-all font-black text-center border border-slate-100 transform active:scale-95 text-sm sm:text-base'
          >
            تـراجع
          </button>
        </div>
      </div>
    </div>
  );
}
