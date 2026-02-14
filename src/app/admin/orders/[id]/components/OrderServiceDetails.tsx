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
    serviceSource: order.serviceSource || '',
    destination: order.destination || '',
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
    <div className='bg-white'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-50'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center'>
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
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <div>
            <h2 className='text-xl font-bold text-slate-800'>بيانات تنفيذ الخدمة</h2>
            <p className='text-slate-500 text-sm font-medium'>التوقيت والمواصفات والأقسام المرتبطة</p>
          </div>
        </div>

        <button
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${
            isEditing ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isEditing ? 'إلغاء' : 'تعديل البيانات'}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100'>
          <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>تاريخ الخدمة</p>
          {isEditing ? (
            <input
              type='date'
              value={formData.createdAt}
              onChange={e => setFormData({ ...formData, createdAt: e.target.value })}
              className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500'
            />
          ) : (
            <p className='text-xl font-black text-slate-800 tracking-tight'>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' }) : '----'}
            </p>
          )}
        </div>

        <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100'>
          <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>العدد المطلوب</p>
          {isEditing ? (
            <input
              type='number'
              min='1'
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500'
            />
          ) : (
            <p className='text-4xl font-black text-slate-800 tracking-tighter'>{order.quantity || 1}</p>
          )}
        </div>

        <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100'>
          <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>المصدر</p>
          {isEditing ? (
            <input
              type="text"
              value={formData.serviceSource}
              onChange={e => setFormData({ ...formData, serviceSource: e.target.value })}
              className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500'
            />
          ) : (
            <p className='text-2xl font-black text-slate-900 tracking-tight'>{order.serviceSource || '----'}</p>
          )}
        </div>

        <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100'>
          <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>الجهة</p>
          {isEditing ? (
            <input
              type="text"
              value={formData.destination}
              onChange={e => setFormData({ ...formData, destination: e.target.value })}
              className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500'
            />
          ) : (
            <p className='text-2xl font-black text-slate-900 tracking-tight'>{order.destination || '----'}</p>
          )}
        </div>

        {isPassport && (
          <>
            <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100'>
              <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>مكان الاستلام</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500'
                />
              ) : (
                <p className='text-2xl font-black text-slate-900 tracking-tight'>{order.pickupLocation || '----'}</p>
              )}
            </div>

            <div className='p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100'>
              <p className='text-base font-bold text-emerald-600/70 uppercase tracking-wider mb-2'>قسم الشرطة</p>
              {isEditing ? (
                <select
                  value={formData.policeStation}
                  onChange={e => setFormData({ ...formData, policeStation: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500'
                >
                  <option value="">اختر القسم...</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="بولاق الدكرور">بولاق الدكرور</option>
                  <option value="6 أكتوبر">6 أكتوبر</option>
                  <option value="الشيخ زايد">الشيخ زايد</option>
                  <option value="العباسية">العباسية</option>
                  <option value="العجوزة">العجوزة</option>
                </select>
              ) : (
                <p className='text-2xl font-black text-slate-800 tracking-tight'>{order.policeStation || '----'}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className='mb-8'>
        <div className='flex items-center gap-2 mb-3'>
          <h3 className='text-base font-black text-slate-800 uppercase tracking-wider'>تفاصيل الخدمة الإضافية</h3>
          <div className='h-[1px] flex-1 bg-slate-100'></div>
        </div>
        {isEditing ? (
          <textarea
            value={formData.serviceDetails}
            onChange={e => setFormData({ ...formData, serviceDetails: e.target.value })}
            className='w-full bg-white border border-slate-200 rounded-2xl p-5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] text-lg'
            placeholder='اكتب تفاصيل الخدمة هنا...'
          />
        ) : (
          <div className='p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700 text-lg font-bold leading-relaxed italic'>
            {order.serviceDetails || 'لا توجد ملاحظات إضافية مسجلة لهذه الخدمة'}
          </div>
        )}
      </div>

      {isEditing && (
        <div className='flex justify-end gap-3 pt-6 border-t border-slate-100'>
          <button
            onClick={onToggleEdit}
            className='px-6 py-3 text-slate-500 font-bold text-base hover:bg-slate-50 rounded-xl transition-colors'
          >
            إلغاء التعديلات
          </button>
          <button
            onClick={handleSave}
            disabled={updating}
            className='px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-bold text-base shadow-lg shadow-slate-200 flex items-center gap-2'
          >
            {updating && <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>}
            حفظ البيانات
          </button>
        </div>
      )}

      {/* Form Serials Section */}
      {order.service?.name?.includes('بطاقة') && (
        <div className='mt-8 pt-8 border-t border-slate-100'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-black text-slate-800 flex items-center gap-2'>
              <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              أرقام الاستمارات المرتبطة
            </h2>
          </div>
          
          <div className='space-y-4'>
            {order.formSerials && order.formSerials.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {order.formSerials.map(formSerial => (
                  <div
                    key={formSerial.id}
                    className='p-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm'
                  >
                    <div>
                      <p className='text-sm font-bold text-slate-400 mb-1 tracking-wider'>رقم الاستمارة</p>
                      <p className='text-3xl font-black text-slate-900 tracking-tighter'>{formSerial.serialNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-6 bg-slate-50/50 border border-dashed border-slate-300 rounded-2xl'>
                <div className='flex gap-3 max-w-md'>
                  <input
                    type='text'
                    value={formSerialNumber}
                    onChange={e => setFormSerialNumber(e.target.value)}
                    className='flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-black'
                    placeholder='رقم الاستمارة...'
                  />
                  <button
                    onClick={onAddFormSerial}
                    disabled={!formSerialNumber.trim() || checkingSerial || updating}
                    className='px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all text-base font-bold disabled:opacity-50'
                  >
                    {checkingSerial ? '...' : 'إضافة'}
                  </button>
                </div>
                {serialError && <p className='mt-2 text-red-500 text-sm font-bold pr-2'>{serialError}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
