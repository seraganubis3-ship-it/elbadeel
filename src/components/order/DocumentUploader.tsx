import { motion } from 'framer-motion';
import Image from 'next/image';

interface Document {
  id: string;
  title: string;
  description?: string;
}

interface DocumentUploaderProps {
  requiredDocuments: Document[];
  selectedFiles: { [key: string]: File | null };
  onFileSelect: (docId: string, file: File | null) => void;
}

export default function DocumentUploader({
  requiredDocuments,
  selectedFiles,
  onFileSelect,
}: DocumentUploaderProps) {
  // Calculate progress
  const uploadedCount = Object.values(selectedFiles).filter(f => f !== null).length;
  const totalCount = requiredDocuments.length;
  const progressPercent = totalCount > 0 ? (uploadedCount / totalCount) * 100 : 100;

  if (requiredDocuments.length === 0) {
    return (
      <div className='text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-dashed border-emerald-200'>
        <div className='w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100'>
          <span className='text-4xl'>✨</span>
        </div>
        <h3 className='text-xl font-black text-slate-800 mb-2'>لا توجد مستندات مطلوبة</h3>
        <p className='text-slate-500 max-w-sm mx-auto'>
          يمكنك المتابعة للخطوة التالية مباشرة دون رفع أي ملفات لهذه الخدمة.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h3 className='text-xl sm:text-2xl font-black text-slate-900 mb-1'>رفع المستندات</h3>
          <p className='text-slate-500 text-sm'>ارفع صور المستندات المطلوبة بجودة واضحة</p>
        </div>

        {/* Progress Badge */}
        <div className='flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200'>
          <div className='w-32 h-2 bg-slate-200 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            className={`text-sm font-bold ${uploadedCount === totalCount ? 'text-emerald-600' : 'text-slate-600'}`}
          >
            {uploadedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {requiredDocuments.map((doc, index) => {
          const file = selectedFiles[doc.id];
          const previewUrl =
            file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className='group'
            >
              {/* Document Header */}
              <div className='flex justify-between items-center mb-3'>
                <label className='text-sm font-bold text-slate-800 flex items-center gap-2'>
                  <span
                    className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}
                  `}
                  >
                    {file ? '✓' : index + 1}
                  </span>
                  {doc.title}
                </label>
                <span
                  className={`
                  px-2 py-1 rounded-md text-[10px] font-bold border
                  ${file ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}
                `}
                >
                  {file ? 'تم الرفع' : 'مطلوب'}
                </span>
              </div>

              {/* Upload Area */}
              <div className='relative'>
                {/* Inputs */}
                <input
                  type='file'
                  id={`file-camera-${doc.id}`}
                  className='hidden'
                  accept='image/*'
                  capture='environment'
                  onChange={e => onFileSelect(doc.id, e.target.files?.[0] || null)}
                />
                <input
                  type='file'
                  id={`file-gallery-${doc.id}`}
                  className='hidden'
                  accept='image/*,.pdf'
                  onChange={e => onFileSelect(doc.id, e.target.files?.[0] || null)}
                />

                {!file ? (
                   <div className="grid grid-cols-2 gap-3">
                      {/* Camera Option */}
                      <label
                        htmlFor={`file-camera-${doc.id}`}
                        className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all h-36 group/camera"
                      >
                         <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-2 group-hover/camera:scale-110 transition-transform">📸</div>
                         <span className="font-bold text-slate-700 text-sm">تصوير</span>
                      </label>

                      {/* Gallery Option */}
                      <label
                        htmlFor={`file-gallery-${doc.id}`}
                        className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all h-36 group/gallery"
                      >
                         <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-2 group-hover/gallery:scale-110 transition-transform">🖼️</div>
                         <span className="font-bold text-slate-700 text-sm">ملف</span>
                      </label>
                   </div>
                ) : (
                  <div
                    className={`
                      relative flex flex-col items-center justify-center w-full h-36 sm:h-40 
                      rounded-2xl border-2 border-solid
                      transition-all duration-300 overflow-hidden
                      border-emerald-400 bg-gradient-to-br from-emerald-50/50 to-teal-50/50
                    `}
                  >
                    <div className='flex items-center gap-4 w-full px-4 sm:px-6'>
                      {/* Preview Thumbnail */}
                      <div className='w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 overflow-hidden'>
                        {previewUrl ? (
                          <Image
                            src={previewUrl}
                            alt='Preview'
                            width={56}
                            height={56}
                            className='object-cover w-full h-full'
                          />
                        ) : (
                          <svg
                            className='w-7 h-7'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                        )}
                      </div>
                      <div className='flex-1 min-w-0 text-right'>
                        <p className='font-bold text-slate-800 truncate text-sm'>{file.name}</p>
                        <p className='text-xs text-slate-500'>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className='w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        onFileSelect(doc.id, null);
                      }}
                      className='absolute top-2 left-2 p-2 bg-white rounded-xl text-rose-500 shadow-md hover:bg-rose-50 border border-slate-200 transition-all z-10 hover:scale-105'
                      title='حذف الملف'
                    >
                      <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {doc.description && (
                <p className='text-xs text-slate-500 mt-2 mr-1 flex items-start gap-1'>
                  <span className='text-slate-400'>💡</span>
                  {doc.description}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
