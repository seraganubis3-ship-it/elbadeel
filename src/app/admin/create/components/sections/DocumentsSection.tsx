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
      className='bg-white rounded-[1.5rem] shadow-lg border border-emerald-100 overflow-hidden mb-0'
    >
      <div className='bg-emerald-50/50 border-b border-emerald-100 p-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-emerald-200 text-xl'>
            📂
          </div>
          <div>
            <h2 className='text-lg font-black text-slate-900 leading-none'>المستندات</h2>
            <p className='text-emerald-500 text-[9px] mt-1 font-black uppercase tracking-widest'>
              الأوراق والملفات
            </p>
          </div>
        </div>
      </div>

      <div className='p-5 space-y-4'>
        {/* Required Documents List */}
        {requiredDocuments.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 text-lg">⚠️</span>
                <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest">
                   المستندات المطلوبة لهذه الخدمة
                </h3>
             </div>
             <ul className="space-y-1 pr-5 list-disc marker:text-amber-400">
                {requiredDocuments.map((doc, i) => (
                   <li key={i} className="text-[11px] font-bold text-slate-600">
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

        {/* Toggles */}
        <div className='flex items-center gap-4 pt-1'>
          <label className='flex items-center gap-1.5 cursor-pointer group'>
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${!formData.hasAttachments ? 'border-sky-500 bg-sky-500 ring-2 ring-sky-500/10' : 'border-slate-300'}`}
            ></div>
            <input
              type='radio'
              checked={!formData.hasAttachments}
              onChange={() => setFormData(p => ({ ...p, hasAttachments: false }))}
              className='hidden'
            />
            <span className='text-[10px] font-bold text-slate-500 group-hover:text-slate-700'>
              بدون مرفقات
            </span>
          </label>
          <label className='flex items-center gap-1.5 cursor-pointer group'>
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${formData.hasAttachments ? 'border-sky-500 bg-sky-500 ring-2 ring-sky-500/10' : 'border-slate-300'}`}
            ></div>
            <input
              type='radio'
              checked={formData.hasAttachments}
              onChange={() => setFormData(p => ({ ...p, hasAttachments: true }))}
              className='hidden'
            />
            <span className='text-[10px] font-bold text-slate-500 group-hover:text-slate-700'>
              بمرفقات
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
