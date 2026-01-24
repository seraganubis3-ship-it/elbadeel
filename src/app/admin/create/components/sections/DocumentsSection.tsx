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
    <div
      id='documents-section'
      className='bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden'
    >
      <div className='bg-sky-50/50 border-b border-sky-100 p-6'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-sky-200 text-2xl'>
            📂
          </div>
          <div>
            <h2 className='text-xl font-black text-slate-900 leading-none'>المستندات</h2>
            <p className='text-sky-500 text-[10px] mt-1.5 font-black uppercase tracking-widest'>
              الأوراق والملفات الرقمية
            </p>
          </div>
        </div>
      </div>

      <div className='p-8 space-y-6'>
        {/* Original Documents */}
        <div className='space-y-2'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
            أصل المستندات المرفقة
          </label>
          <textarea
            value={formData.originalDocuments}
            onChange={e => setFormData(prev => ({ ...prev, originalDocuments: e.target.value }))}
            rows={2}
            className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 transition-all font-bold text-sm'
            placeholder='وصف للأصول المسلمة...'
          />
        </div>

        {/* Attachments Management */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              المرفقات الرقمية
            </label>
            <button
              type='button'
              onClick={() => setShowAttachmentModal(true)}
              className='text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest'
            >
              + إضافة مرفق
            </button>
          </div>

          <div className='space-y-2'>
            {formData.attachedDocuments.length === 0 ? (
              <div className='p-10 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-center'>
                <span className='text-3xl opacity-20 filter grayscale'>📄</span>
                <p className='text-slate-300 text-xs font-bold mt-2 uppercase tracking-widest'>
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
                      className='flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1.5 rounded-full group hover:border-slate-300 transition-all'
                    >
                      <span className='text-xs'>{isUploadedFile ? '📁' : '📄'}</span>
                      <span className='text-[11px] font-bold text-slate-600 truncate max-w-[100px]'>
                        {doc}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleRemoveAttachment(index)}
                        className='w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white transition-colors text-[8px] font-black'
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

        {/* Toggles */}
        <div className='flex items-center gap-6 pt-2'>
          <label className='flex items-center gap-2 cursor-pointer group'>
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all ${!formData.hasAttachments ? 'border-sky-500 bg-sky-500 ring-4 ring-sky-500/10' : 'border-slate-300'}`}
            ></div>
            <input
              type='radio'
              checked={!formData.hasAttachments}
              onChange={() => setFormData(p => ({ ...p, hasAttachments: false }))}
              className='hidden'
            />
            <span className='text-xs font-bold text-slate-500 group-hover:text-slate-700'>
              بدون مرفقات
            </span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer group'>
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all ${formData.hasAttachments ? 'border-sky-500 bg-sky-500 ring-4 ring-sky-500/10' : 'border-slate-300'}`}
            ></div>
            <input
              type='radio'
              checked={formData.hasAttachments}
              onChange={() => setFormData(p => ({ ...p, hasAttachments: true }))}
              className='hidden'
            />
            <span className='text-xs font-bold text-slate-500 group-hover:text-slate-700'>
              بمرفقات
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
