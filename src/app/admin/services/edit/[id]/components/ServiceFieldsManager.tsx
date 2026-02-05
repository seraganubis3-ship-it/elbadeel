'use client';

import React from 'react';
import Button from '@/components/Button';

import { ServiceField, ServiceDocument, ServiceFieldOption } from '../types';

interface ServiceFieldsManagerProps {
  fields: ServiceField[];
  setFields: React.Dispatch<React.SetStateAction<ServiceField[]>>;
  availableDocuments: ServiceDocument[];
}

export default function ServiceFieldsManager({
  fields,
  setFields,
  availableDocuments,
}: ServiceFieldsManagerProps) {
  const addField = () => {
    setFields(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: `question_${prev.length + 1}`,
        label: '',
        type: 'select',
        required: true,
        active: true,
        options: [],
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof ServiceField, value: any) => {
    setFields(prev =>
      prev.map((f, i) => (i === index ? ({ ...f, [field]: value } as ServiceField) : f))
    );
  };

  const addOption = (fieldIndex: number) => {
    setFields(prev => {
      const newFields = [...prev];
      const field = newFields[fieldIndex];
      if (field) {
        field.options = [
          ...field.options,
          {
            id: `temp-opt-${Date.now()}`,
            value: '',
            label: '',
            requiredDocs: [],
          },
        ];
      }
      return newFields;
    });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setFields(prev => {
      const newFields = [...prev];
      const field = newFields[fieldIndex];
      if (field) {
        field.options = field.options.filter((_, i) => i !== optionIndex);
      }
      return newFields;
    });
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    field: keyof ServiceFieldOption,
    value: any
  ) => {
    setFields(prev => {
      const newFields = [...prev];
      const fieldObj = newFields[fieldIndex];
      if (fieldObj && fieldObj.options[optionIndex]) {
        fieldObj.options[optionIndex] = {
          ...fieldObj.options[optionIndex],
          [field]: value,
        } as ServiceFieldOption;
      }
      return newFields;
    });
  };

  const toggleDocForOption = (fieldIndex: number, optionIndex: number, docTitle: string) => {
    const field = fields[fieldIndex];
    if (!field) return;
    const option = field.options[optionIndex];
    if (!option) return;

    const currentDocs = option.requiredDocs || [];
    const newDocs = currentDocs.includes(docTitle)
      ? currentDocs.filter(d => d !== docTitle)
      : [...currentDocs, docTitle];

    updateOption(fieldIndex, optionIndex, 'requiredDocs', newDocs);
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-bold text-gray-900'>الأسئلة الديناميكية (Quiz)</h3>
          <p className='text-sm text-gray-500 mt-1'>تخصيص أسئلة للخدمة تؤثر على المتطلبات</p>
        </div>
        <Button
          type='button'
          onClick={addField}
          className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-2'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          إضافة سؤال جديد
        </Button>
      </div>

      <div className='space-y-6'>
        {fields.map((field, fIdx) => (
          <div
            key={field.id}
            className='bg-white border-2 border-purple-50 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group'
          >
            {/* Visual Accent */}
            <div className='absolute top-0 right-0 w-2 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity'></div>

            <div className='flex flex-col gap-6'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1 space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-xs font-black text-purple-400 uppercase tracking-widest mb-2'>
                        نص السؤال *
                      </label>
                      <input
                        type='text'
                        value={field.label}
                        onChange={e => updateField(fIdx, 'label', e.target.value)}
                        className='w-full px-5 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-gray-800'
                        placeholder='مثال: هل تقوم باستخراج البطاقة لأول مرة؟'
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-black text-purple-400 uppercase tracking-widest mb-2'>
                        نوع السؤال
                      </label>
                      <select
                        value={field.type}
                        onChange={e => updateField(fIdx, 'type', e.target.value)}
                        className='w-full px-5 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-gray-800 appearance-none'
                      >
                         <option value="select">اختيارات (Dropdown)</option>
                         <option value="text">نص قصير (Input)</option>
                         <option value="textarea">نص طويل (Textarea)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs font-black text-purple-400 uppercase tracking-widest mb-2'>
                        الاسم البرمجي (اختياري)
                      </label>
                      <input
                        type='text'
                        value={field.name}
                        onChange={e => updateField(fIdx, 'name', e.target.value)}
                        className='w-full px-5 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-mono text-sm'
                        placeholder='request_type'
                      />
                    </div>
                    {(field.type === 'text' || field.type === 'textarea') && (
                       <div>
                          <label className='block text-xs font-black text-purple-400 uppercase tracking-widest mb-2'>
                            نص توضيحي (Placeholder)
                          </label>
                          <input
                            type='text'
                            value={field.placeholder || ''}
                            onChange={e => updateField(fIdx, 'placeholder', e.target.value)}
                            className='w-full px-5 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-gray-800'
                            placeholder='مثال: اكتب اسمك هنا...'
                          />
                       </div>
                    )}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => removeField(fIdx)}
                  className='p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>

              {/* Options Section - ONLY SHOW FOR SELECT TYPE */}
              {field.type === 'select' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-black text-gray-400 uppercase tracking-widest'>
                    الاختيارات المتاحة لهذا السؤال
                  </span>
                  <button
                    type='button'
                    onClick={() => addOption(fIdx)}
                    className='text-xs font-black text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl border border-purple-200 transition-colors'
                  >
                    + إضافة اختيار
                  </button>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                  {field.options.map((opt, oIdx) => (
                    <div
                      key={opt.id}
                      className='p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='flex-1'>
                          <input
                            type='text'
                            value={opt.label}
                            onChange={e => updateOption(fIdx, oIdx, 'label', e.target.value)}
                            onBlur={() => updateOption(fIdx, oIdx, 'value', opt.label)}
                            className='w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-bold'
                            placeholder='نص الاختيار (مثال: نعم، لأول مرة)'
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => removeOption(fIdx, oIdx)}
                          className='text-slate-400 hover:text-red-500 transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
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

                      {/* Required Documents for this option */}
                      <div>
                        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                          المستندات الإضافية المطلوبة عند اختيار هذا الرد:
                        </label>
                        <div className='flex flex-wrap gap-2'>
                          {availableDocuments.map(doc => (
                            <button
                              key={doc.id}
                              type='button'
                              onClick={() => toggleDocForOption(fIdx, oIdx, doc.title)}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                (opt.requiredDocs || []).includes(doc.title)
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              {doc.title}
                            </button>
                          ))}
                          {availableDocuments.length === 0 && (
                            <span className='text-xs text-slate-400 italic'>
                              برجاء إضافة مستندات في تبويب المستندات أولاً ليتم ربطها هنا
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {field.options.length === 0 && (
                    <div className='p-4 text-center text-sm text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl'>
                      لم يتم إضافة اختيارات لهذا السؤال بعد
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className='text-center py-20 bg-purple-50/30 rounded-[3rem] border-2 border-dashed border-purple-100'>
            <div className='w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-purple-100 rotate-6 translate-y-2 group-hover:rotate-0 group-hover:translate-y-0 transition-transform duration-500'>
              <span className='text-3xl'>❓</span>
            </div>
            <h4 className='text-xl font-black text-purple-900 mb-2'>لا توجد أسئلة ديناميكية</h4>
            <p className='text-slate-500 font-bold max-w-sm mx-auto'>
              أضف أسئلة تظهر للعميل عند طلب هذه الخدمة لتخصيص تجربته وتحديد متطلباته بدقة
            </p>
            <button
              type='button'
              onClick={addField}
              className='mt-8 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-105'
            >
              ابدأ بإضافة أول سؤال
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
