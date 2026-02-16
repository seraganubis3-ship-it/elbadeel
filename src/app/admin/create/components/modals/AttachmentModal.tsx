'use client';

import { useState } from 'react';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, file: File | null) => Promise<void>;
}

export function AttachmentModal({ isOpen, onClose, onSave }: AttachmentModalProps) {
  const [attachments, setAttachments] = useState<{ id: number; name: string; file: File | null }[]>([
    { id: 1, name: '', file: null },
  ]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setAttachments(prev => [...prev, { id: Date.now(), name: '', file: null }]);
  };

  const handleRemoveRow = (id: number) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  const updateAttachment = (id: number, field: 'name' | 'file', value: any) => {
    setAttachments(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    const validAttachments = attachments.filter(a => a.name.trim());
    if (validAttachments.length === 0) return;

    setSaving(true);
    try {
      // Process all attachments sequentially
      for (const att of validAttachments) {
        await onSave(att.name.trim(), att.file);
      }
      // Reset and close
      setAttachments([{ id: Date.now(), name: '', file: null }]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAttachments([{ id: Date.now(), name: '', file: null }]);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-lg font-bold text-gray-900 mb-4'>إضافة مرفقات</h3>

        <div className='space-y-6'>
          {attachments.map((att, index) => (
            <div key={att.id} className='p-4 bg-gray-50 rounded-xl border border-gray-200 relative'>
              {attachments.length > 1 && (
                <button
                  onClick={() => handleRemoveRow(att.id)}
                  className='absolute top-2 left-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm'
                  title='حذف'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              )}
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* اسم المرفق */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    اسم المرفق {index + 1} *
                  </label>
                  <input
                    type='text'
                    value={att.name}
                    onChange={e => updateAttachment(att.id, 'name', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white'
                    placeholder='مثال: شهادة ميلاد'
                  />
                </div>

                {/* رفع ملف */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    ملف (اختياري)
                  </label>
                  <input
                    type='file'
                    onChange={e => updateAttachment(att.id, 'file', e.target.files?.[0] || null)}
                    accept='.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'
                  />
                  {att.file && (
                    <p className='text-xs text-green-600 mt-1 truncate'>
                       {att.file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Row Button */}
          <button
            type='button'
            onClick={handleAddRow}
            className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all font-bold flex items-center justify-center gap-2'
          >
            <span className='text-xl'>+</span> إضافة مرفق آخر
          </button>

          {/* Actions */}
          <div className='flex space-x-3 space-x-reverse pt-4 border-t border-gray-100'>
            <button
              type='button'
              onClick={handleSave}
              disabled={saving || attachments.every(a => !a.name.trim())}
              className='flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200'
            >
              {saving ? 'جاري الحفظ...' : 'حفظ جميع المرفقات'}
            </button>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors'
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
