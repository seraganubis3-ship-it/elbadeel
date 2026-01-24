'use client';

import { useState } from 'react';

import Image from 'next/image';
interface DocumentPreviewProps {
  file: File;
  onRemove: () => void;
  onReplace: (file: File) => void;
}

export default function DocumentPreview({ file, onRemove, onReplace }: DocumentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.startsWith('text/')) {
      return '📝';
    } else {
      return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = () => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleFileReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (newFile) {
      onReplace(newFile);
      setIsReplacing(false);
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200'>
      {/* File Header */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3 space-x-reverse'>
            <div className='text-2xl'>{getFileIcon(file.type)}</div>
            <div>
              <h4 className='font-medium text-gray-900 text-sm truncate max-w-48'>{file.name}</h4>
              <p className='text-xs text-gray-500'>
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2 space-x-reverse'>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200'
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </button>

            <button
              onClick={() => setIsReplacing(!isReplacing)}
              className='p-2 text-blue-400 hover:text-blue-600 transition-colors duration-200'
              title='استبدال الملف'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </button>

            <button
              onClick={onRemove}
              className='p-2 text-red-400 hover:text-red-600 transition-colors duration-200'
              title='إزالة الملف'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

      {/* File Replace Input */}
      {isReplacing && (
        <div className='px-4 py-3 bg-blue-50 border-b border-blue-200'>
          <div className='flex items-center space-x-3 space-x-reverse'>
            <input
              type='file'
              accept={file.type}
              onChange={handleFileReplace}
              className='flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            <button
              onClick={() => setIsReplacing(false)}
              className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200'
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* File Preview */}
      {isExpanded && (
        <div className='p-4 bg-gray-50'>
          {getFilePreview() ? (
            <div className='space-y-3'>
              <div className='relative'>
                <Image
                  src={getFilePreview()!}
                  alt='Preview'
                  width={400}
                  height={256}
                  className='w-full max-h-64 object-contain rounded-lg border border-gray-200'
                />
                <div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded'>
                  معاينة
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-xs text-gray-600'>
                <div>
                  <span className='font-medium'>اسم الملف:</span>
                  <p className='truncate'>{file.name}</p>
                </div>
                <div>
                  <span className='font-medium'>الحجم:</span>
                  <p>{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <span className='font-medium'>النوع:</span>
                  <p>{file.type}</p>
                </div>
                <div>
                  <span className='font-medium'>آخر تعديل:</span>
                  <p>{new Date(file.lastModified).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='text-4xl mb-3'>{getFileIcon(file.type)}</div>
              <p className='text-gray-600 text-sm'>لا يمكن عرض معاينة لهذا النوع من الملفات</p>
              <p className='text-gray-500 text-xs mt-1'>
                {file.name} • {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* File Validation Status */}
      <div className='px-4 py-2 bg-green-50 border-t border-green-200'>
        <div className='flex items-center space-x-2 space-x-reverse'>
          <svg
            className='w-4 h-4 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span className='text-sm text-green-700 font-medium'>ملف صالح</span>
        </div>
      </div>
    </div>
  );
}
