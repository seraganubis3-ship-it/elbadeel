'use client';

import { useState } from 'react';
import { Order } from '../types';

interface OrderServiceDetailsProps {
  order: Order;
  formSerialNumber: string;
  setFormSerialNumber: (val: string) => void;
  onAddFormSerial: () => void;
  checkingSerial: boolean;
  updating: boolean;
  serialError: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (fields: Partial<Order>) => void;
}

export default function OrderServiceDetails({
  order,
  formSerialNumber,
  setFormSerialNumber,
  onAddFormSerial,
  checkingSerial,
  updating,
  serialError,
  isEditing,
  onToggleEdit,
  onSave,
}: OrderServiceDetailsProps) {
  const [formData, setFormData] = useState({
    serviceDetails: order.serviceDetails || '',
    quantity: order.quantity || 1,
    policeStation: order.policeStation || '',
    pickupLocation: order.pickupLocation || '',
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '',
  });

  const handleSave = () => {
    // Filter out empty strings to match Partial<Order> requirements
    const updates: Partial<Order> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') {
        if (key === 'createdAt') {
          (updates as any)[key] = new Date(value as string).toISOString();
        } else {
          (updates as any)[key] = value;
        }
      }
    });
    onSave(updates);
  };

  const isPassport =
    order.service?.slug?.toLowerCase().includes('passport') || 
    (order.service?.name || '').toLowerCase().includes('passport') || 
    (order.service?.name || '').includes('جواز');

  return (
    <div className='group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(245,158,11,0.1)]'>
      <div className='absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700'></div>

      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-500'>
            <svg
              className='w-7 h-7 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <div className='mr-5'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>تفاصيل الخدمة</h2>
            <p className='text-slate-500 font-medium text-sm'>
              بيانات التنفيذ ومواصفات الطلب الأساسية
            </p>
          </div>
        </div>

        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <button
                onClick={onToggleEdit}
                disabled={updating}
                className='px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-sm'
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className='px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-amber-200 flex items-center gap-2'
              >
                {updating && (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                )}
                حفظ التغييرات
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEdit}
              className='p-3 bg-white/80 hover:bg-amber-50 text-amber-600 rounded-xl transition-all duration-300 shadow-sm border border-amber-100/50 group/btn'
            >
              <svg
                className='w-5 h-5 group-hover/btn:rotate-12 transition-transform'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
        <div className='space-y-6'>
          <div className='p-6 bg-white/30 rounded-3xl border border-white/40'>
            <h2 className='text-sm font-black text-amber-700 uppercase tracking-widest mb-6 border-b border-amber-100 pb-3'>
              الكميات والمواصفات
            </h2>
            <div className='space-y-5'>
              <div className='flex justify-between items-center group/field'>
                <span className='text-slate-500 font-bold text-sm'>تاريخ الخدمة:</span>
                {isEditing ? (
                  <input
                    type='date'
                    value={formData.createdAt}
                    onChange={e => setFormData({ ...formData, createdAt: e.target.value })}
                    className='bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 text-center'
                  />
                ) : (
                  <span className='text-slate-800 font-black group-hover/field:text-amber-600 transition-colors'>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : '----'}
                  </span>
                )}
              </div>
              <div className='flex justify-between items-center group/field'>
                <span className='text-slate-500 font-bold text-sm'>العدد المطلوب:</span>
                {isEditing ? (
                  <input
                    type='number'
                    min='1'
                    value={formData.quantity}
                    onChange={e =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                    className='bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 w-20 text-center'
                  />
                ) : (
                  <span className='text-slate-800 font-black group-hover/field:text-amber-600 transition-colors'>
                    {order.quantity || 1}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isPassport && (
          <div className='space-y-6'>
            <div className='p-6 bg-white/30 rounded-3xl border border-white/40'>
              <h2 className='text-sm font-black text-emerald-700 uppercase tracking-widest mb-6 border-b border-emerald-100 pb-3'>
                بيانات الجوازات
              </h2>
              <div className='space-y-5'>
                <div className='flex justify-between items-center group/field'>
                  <span className='text-slate-500 font-bold text-sm'>قسم الجوازات:</span>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.policeStation}
                        onChange={e => setFormData({ ...formData, policeStation: e.target.value })}
                        className='bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 appearance-none pr-8'
                      >
                        <option value="">اختر القسم...</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="بولاق الدكرور">بولاق الدكرور</option>
                        <option value="6 أكتوبر">6 أكتوبر</option>
                        <option value="الشيخ زايد">الشيخ زايد</option>
                        <option value="العباسية">العباسية</option>
                        <option value="العجوزة">العجوزة</option>
                      </select>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  ) : (
                    <span className='text-slate-800 font-black group-hover/field:text-emerald-600 transition-colors'>
                      {order.policeStation || '----'}
                    </span>
                  )}
                </div>

                <div className='flex justify-between items-center group/field'>
                  <span className='text-slate-500 font-bold text-sm'>مكان الاستلام:</span>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.pickupLocation}
                        onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                        className='bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500 w-full'
                        placeholder="مكان الاستلام"
                      />
                    </div>
                  ) : (
                    <span className='text-slate-800 font-black group-hover/field:text-emerald-600 transition-colors'>
                      {order.pickupLocation || '----'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Details Area */}
      <div className='mb-10 bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200'>
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
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-black text-slate-800'>تفاصيل الخدمة</h2>
        </div>
        {isEditing ? (
          <textarea
            value={formData.serviceDetails}
            onChange={e => setFormData({ ...formData, serviceDetails: e.target.value })}
            className='w-full bg-white border border-indigo-200 rounded-3xl p-6 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none'
            rows={4}
            placeholder='اكتب تفاصيل الخدمة هنا...'
          />
        ) : (
          <div className='p-8 bg-white/80 rounded-[2rem] border border-indigo-100/50 whitespace-pre-wrap text-slate-700 font-black leading-loose shadow-sm'>
            {order.serviceDetails || 'لا توجد ملاحظات إضافية'}
          </div>
        )}
      </div>

      {/* Form Serials Section */}
      {order.service?.name?.includes('بطاقة') && (
        <div className='mt-8 border-t border-slate-100 pt-8'>
          <h2 className='text-lg font-black text-slate-800 mb-6 flex items-center gap-2'>
            <span className='w-2 h-2 bg-amber-500 rounded-full animate-ping'></span>
            أرقام الاستمارات المرتبطة
          </h2>
          {order.formSerials && order.formSerials.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {order.formSerials.map(formSerial => (
                <div
                  key={formSerial.id}
                  className='p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl group/scroll hover:bg-emerald-50 transition-colors'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1'>
                        رقم الاستمارة
                      </p>
                      <p className='text-xl font-black text-slate-800 tracking-tighter'>
                        {formSerial.serialNumber}
                      </p>
                    </div>
                    <div className='text-left'>
                      <p className='text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1'>
                        الحالة
                      </p>
                      <span className='px-3 py-1 bg-white text-emerald-600 rounded-full text-[10px] font-black shadow-sm'>
                        نشط
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-8 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] text-center'>
              <div className='max-w-md mx-auto'>
                <div className='flex gap-3 mb-4'>
                  <input
                    type='text'
                    value={formSerialNumber}
                    onChange={e => setFormSerialNumber(e.target.value)}
                    className='flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold'
                    placeholder='أدخل رقم الاستمارة للربط...'
                  />
                  <button
                    onClick={onAddFormSerial}
                    disabled={!formSerialNumber.trim() || checkingSerial || updating}
                    className='px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-lg shadow-slate-200 disabled:opacity-50'
                  >
                    {checkingSerial ? '...' : 'ربط'}
                  </button>
                </div>
                {serialError && <p className='text-red-500 text-xs font-bold'>{serialError}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
