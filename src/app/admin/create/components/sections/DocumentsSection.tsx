import React from 'react';
import { FormData } from '../../types';

interface DocumentsSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setShowAttachmentModal: (show: boolean) => void;
  handleRemoveAttachment: (index: number) => void;
  uploadedFiles: File[];
  requiredDocuments: string[];
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  formData,
  setFormData,
  setShowAttachmentModal,
  handleRemoveAttachment,
  uploadedFiles,
  requiredDocuments,
}) => {
  return (
    <div className='bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md'>
      {/* Visual Accent - Top */}
      <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-blue-600/80 opacity-90'></div>

      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100 text-blue-600'>
            <span>📄</span>
          </div>
          <div>
            <h2 className='text-xl font-bold text-slate-800'>المستندات المطلوبة</h2>
            <p className='text-xs text-slate-500 font-medium'>الوثائق والمرفقات</p>
          </div>
        </div>
      </div>

      <div className='p-5 space-y-4'>
        {/* Required Documents List */}
        {requiredDocuments.length > 0 && (
          <div className='bg-amber-50 border border-amber-100 rounded-xl p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-amber-500 text-lg'>⚠️</span>
              <h3 className='text-xs font-black text-amber-700 uppercase tracking-widest'>
                المستندات المطلوبة لهذه الخدمة
              </h3>
            </div>
            <ul className='space-y-1 pr-5 list-disc marker:text-amber-400'>
              {requiredDocuments.map((doc, i) => (
                <li key={i} className='text-[11px] font-bold text-slate-600'>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className='space-y-1.5'>
          <textarea
            value={formData.originalDocuments}
            onChange={e => setFormData(p => ({ ...p, originalDocuments: e.target.value }))}
            rows={1}
            className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-sky-500 transition-all font-bold text-black placeholder:text-slate-400 text-xs'
            placeholder='وصف للأصول المسلمة...'
          />
        </div>

        {/* Attachments Management */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <label className='text-[10px] font-black text-black uppercase tracking-widest'>
              المرفقات الرقمية
            </label>
            <button
              type='button'
              onClick={() => setShowAttachmentModal(true)}
              className='text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest'
            >
              + إضافة مرفق
            </button>
          </div>

          <div className='space-y-2'>
            {formData.attachedDocuments.length === 0 ? (
              <div className='p-4 border-2 border-dashed border-slate-100 rounded-xl text-center'>
                <span className='text-xl opacity-20 filter grayscale'>📄</span>
                <p className='text-slate-300 text-[10px] font-bold mt-1 uppercase tracking-widest'>
                  لا توجد ملفات
                </p>
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {formData.attachedDocuments.map((doc, index) => {
                  const isUploadedFile = uploadedFiles.some(
                    (_: File, fileIndex: number) => fileIndex === index
                  );
                  return (
                    <div
                      key={index}
                      className='flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-2 py-1 rounded-lg group hover:border-slate-300 transition-all'
                    >
                      <span className='text-[10px]'>{isUploadedFile ? '📁' : '📄'}</span>
                      <span className='text-[10px] font-bold text-slate-600 truncate max-w-[80px]'>
                        {doc}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleRemoveAttachment(index)}
                        className='w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white transition-colors text-[8px] font-black'
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
