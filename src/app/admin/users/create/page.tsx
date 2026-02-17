'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';

export default function CreateAdminPage() {
  const router = useRouter();
  const [addAdminForm, setAddAdminForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
  });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  const addNewAdmin = async () => {
    // التحقق من صحة البيانات
    if (!addAdminForm.name || !addAdminForm.phone || !addAdminForm.password) {
      showWarning('الحقول المطلوبة فارغة', 'جميع الحقول المطلوبة يجب ملؤها');
      return;
    }

    if (addAdminForm.password !== addAdminForm.confirmPassword) {
      showWarning('كلمات المرور غير متطابقة', 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    if (addAdminForm.password.length < 6) {
      showWarning('كلمة المرور قصيرة', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setAddingAdmin(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addAdminForm.name,
          phone: addAdminForm.phone,
          password: addAdminForm.password,
          role: addAdminForm.role,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setShowSuccessMessage(true);
          // إعادة تعيين النموذج
          setAddAdminForm({
            name: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: 'STAFF',
          });

          showSuccess('تم إنشاء المشرف بنجاح! 👤', `تم إنشاء المشرف "${addAdminForm.name}" بنجاح`);

          // إعادة التوجيه إلى صفحة المستخدمين بعد 3 ثوان
          setTimeout(() => {
            router.push('/admin/users');
          }, 3000);
        } else {
          showError('فشل في إنشاء المشرف', result.error || 'حدث خطأ في إنشاء المشرف');
        }
      } else {
        const errorData = await res.json();
        showError('فشل في إنشاء المشرف', errorData.error || 'حدث خطأ في إنشاء المشرف');
      }
    } catch (error) {
      //
      // showError(
      // "خطأ في الاتصال",
      // "حدث خطأ في إنشاء المشرف. يرجى المحاولة مرة أخرى"
      // );
      // } finally {
      setAddingAdmin(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200 shadow-sm mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-3xl font-bold text-emerald-800 mb-2'>إضافة مشرف جديد</h1>
                <p className='text-emerald-600 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  إنشاء حساب مشرف جديد في النظام
                </p>
              </div>
            </div>
            <Link
              href='/admin/users'
              className='inline-flex items-center px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-medium shadow-sm'
            >
              <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              العودة لإدارة المستخدمين
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className='bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-xl mb-6 border border-green-400'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <p className='font-bold text-lg'>تم إنشاء المشرف الجديد بنجاح! 🎉</p>
                <p className='text-sm opacity-90 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  سيتم إعادة توجيهك إلى صفحة إدارة المستخدمين خلال لحظات...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className='bg-white rounded-2xl p-8 shadow-sm border'>
          <div className='max-w-2xl mx-auto'>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 text-emerald-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  الاسم الكامل *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                  <input
                    type='text'
                    value={addAdminForm.name}
                    onChange={e => setAddAdminForm({ ...addAdminForm, name: e.target.value })}
                    className='w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all duration-200'
                    placeholder='أدخل الاسم الكامل'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                    رقم الهاتف *
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                    </div>
                    <input
                      type='tel'
                      value={addAdminForm.phone}
                      onChange={e => setAddAdminForm({ ...addAdminForm, phone: e.target.value })}
                      className='w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all duration-200'
                      placeholder='أدخل رقم الهاتف'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      />
                    </svg>
                    الدور *
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                        />
                      </svg>
                    </div>
                    <select
                      value={addAdminForm.role}
                      onChange={e => setAddAdminForm({ ...addAdminForm, role: e.target.value })}
                      className='w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 transition-all duration-200 appearance-none bg-white'
                    >
                      <option value='STAFF'>موظف</option>
                      <option value='ADMIN'>مدير</option>
                      <option value='VIEWER'>مشاهد</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-emerald-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                    كلمة المرور *
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </div>
                    <input
                      type='password'
                      value={addAdminForm.password}
                      onChange={e => setAddAdminForm({ ...addAdminForm, password: e.target.value })}
                      className='w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all duration-200'
                      placeholder='6 أحرف على الأقل'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-emerald-600'
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
                    تأكيد كلمة المرور *
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-400'
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
                    </div>
                    <input
                      type='password'
                      value={addAdminForm.confirmPassword}
                      onChange={e =>
                        setAddAdminForm({ ...addAdminForm, confirmPassword: e.target.value })
                      }
                      className='w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all duration-200'
                      placeholder='أعد إدخال كلمة المرور'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
              <Link
                href='/admin/users'
                className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-center flex items-center justify-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
                إلغاء والعودة
              </Link>
              <button
                onClick={addNewAdmin}
                disabled={addingAdmin}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl'
              >
                {addingAdmin ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    جاري الإنشاء...
                  </div>
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                    إنشاء المشرف
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
