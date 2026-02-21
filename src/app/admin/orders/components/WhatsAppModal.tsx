'use client';

import { Order, WhatsAppTemplate, getWhatsappTemplates } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  order: Order | null;
  message: string;
  selectedTemplate: string;
  sending: boolean;
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onTemplateSelect: (templateId: string) => void;
  onSend: () => void;
}

export function WhatsAppModal({
  isOpen,
  order,
  message,
  selectedTemplate,
  sending,
  onClose,
  onMessageChange,
  onTemplateSelect,
  onSend,
}: WhatsAppModalProps) {
  if (!isOpen || !order) return null;

  const templates = getWhatsappTemplates(order);
  const phone =
    order.customerPhone && order.customerPhone !== 'unknown'
      ? order.customerPhone
      : order.user?.phone || 'غير متوفر';

  const handleTemplateChange = (templateId: string) => {
    onTemplateSelect(templateId);
    const template = templates.find((t: WhatsAppTemplate) => t.id === templateId);
    if (template) {
      onMessageChange(template.message);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all'>
          {/* Header */}
          <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                  <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-lg font-bold text-white'>إرسال رسالة واتساب</h3>
                  <p className='text-green-100 text-sm'>{order.customerName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-white/20 rounded-full transition-colors'
              >
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
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='p-6'>
            {/* Phone Number */}
            <div className='mb-4 p-3 bg-gray-50 rounded-xl'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500'>رقم الهاتف:</span>
                <span className='font-medium text-gray-900' dir='ltr'>
                  {phone}
                </span>
              </div>
            </div>

            {/* Template Selector */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>اختر قالب جاهز</label>
              <select
                value={selectedTemplate}
                onChange={e => handleTemplateChange(e.target.value)}
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm'
              >
                <option value=''>-- اختر قالب --</option>
                {templates.map((template: WhatsAppTemplate) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Textarea */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>الرسالة</label>
              <textarea
                value={message}
                onChange={e => onMessageChange(e.target.value)}
                rows={6}
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm resize-none'
                placeholder='اكتب رسالتك هنا...'
              />
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium'
              >
                إلغاء
              </button>
              <button
                onClick={onSend}
                disabled={sending || !message.trim()}
                className='flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {sending ? (
                  <>
                    <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                    </svg>
                    إرسال
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
