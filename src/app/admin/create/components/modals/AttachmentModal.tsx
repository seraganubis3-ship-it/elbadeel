'use client';

import { useState } from 'react';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, file: File | null) => Promise<void>;
}

export function AttachmentModal({ isOpen, onClose, onSave }: AttachmentModalProps) {
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!attachmentName.trim()) return;

    setSaving(true);
    try {
      await onSave(attachmentName.trim(), attachmentFile);
      setAttachmentName('');
      setAttachmentFile(null);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAttachmentName('');
    setAttachmentFile(null);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h3 className='text-lg font-bold text-gray-900 mb-4'>إضافة مرفق</h3>

        <div className='space-y-4'>
          {/* اسم المرفق */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>اسم المرفق *</label>
            <input
              type='text'
              value={attachmentName}
              onChange={e => setAttachmentName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white'
              placeholder='مثال: شهادة ميلاد، صورة شخصية، إلخ'
            />
          </div>

          {/* رفع ملف (اختياري) */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              رفع ملف (اختياري)
            </label>
            <input
              type='file'
              onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
              accept='.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white'
            />
            {attachmentFile && (
              <p className='text-sm text-green-600 mt-1'>تم اختيار: {attachmentFile.name}</p>
            )}
          </div>

          {/* أزرار */}
          <div className='flex space-x-3 space-x-reverse'>
            <button
              type='button'
              onClick={handleSave}
              disabled={saving || !attachmentName.trim()}
              className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors'
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
