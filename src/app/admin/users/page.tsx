'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
  lastLogin?: string;
  phone?: string;
  ordersCount?: number;
  createdByAdminId?: string | null;
  createdByAdmin?: { id: string; name: string; email: string } | null;
  adminRoleId?: string | null;
  adminRole?: { id: string; name: string } | null;
}

interface UserStats {
  total: number;
  active: number;
  admins: number;
  staff: number;
  users: number;
  viewers: number;
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [adminRoles, setAdminRoles] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    admins: 0,
    staff: 0,
    users: 0,
    viewers: 0,
  });
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    adminRoleId: '',
    isActive: true,
    newPassword: '',
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(''); // لتتبع الفلتر النشط
  const didInit = useRef(false);
  const debounceRef = useRef<any>(null);

  const fetchUsers = useCallback(
    async (resetPage?: boolean, nextRole?: string, nextQ?: string, nextStatus?: string) => {
      setLoading(true);
      try {
        const targetPage = resetPage ? 1 : page;
        const effectiveRole = typeof nextRole === 'string' ? nextRole : role;
        const effectiveQ = typeof nextQ === 'string' ? nextQ : q;
        const effectiveStatus = typeof nextStatus === 'string' ? nextStatus : status;

        const params = new URLSearchParams();

        // إذا كان هناك فلتر نشط، استخدمه مع البحث العادي
        if (activeFilter && effectiveQ && !effectiveQ.startsWith('createdBy:')) {
          // البحث داخل الفلتر النشط
          params.set('q', effectiveQ);
          params.set('filter', activeFilter); // معامل جديد للفلتر
        } else if (effectiveQ) {
          params.set('q', effectiveQ);
        }

        if (effectiveRole) params.set('role', effectiveRole);
        if (effectiveStatus) params.set('status', effectiveStatus);
        params.set('page', String(targetPage));
        params.set('pageSize', String(pageSize));

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRows(data.rows);
          setPage(data.page);
          setTotalPages(data.totalPages);
          if (data.stats) setStats(data.stats);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, role, q, status, activeFilter, pageSize]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        // إذا فشل الـ API، احسب الإحصائيات من البيانات الموجودة
        const calculatedStats = {
          total: rows.length,
          active: rows.filter(u => u.isActive !== false).length,
          admins: rows.filter(u => u.role === 'ADMIN' || u.adminRole !== null).length,
          staff: rows.filter(u => u.role === 'STAFF').length,
          users: rows.filter(u => u.role === 'USER').length,
          viewers: rows.filter(u => u.role === 'VIEWER').length,
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      //
      // // في حالة الخطأ، احسب الإحصائيات من البيانات الموجودة
      // const calculatedStats = {
      // total: rows.length,
      // active: rows.filter(u => u.isActive !== false).length,
      // admins: rows.filter(u => u.role === 'ADMIN' || u.adminRole !== null).length,
      // staff: rows.filter(u => u.role === 'STAFF').length,
      // users: rows.filter(u => u.role === 'USER').length,
      // viewers: rows.filter(u => u.role === 'VIEWER').length
      // };
      // setStats(calculatedStats);
    }
  }, [rows]);

  const fetchAdminRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setAdminRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin roles', error);
    }
  }, []);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      fetchUsers(true);
      fetchStats();
      fetchAdminRoles();
    }
  }, [fetchUsers, fetchStats, fetchAdminRoles]);

  // تحميل البيانات عند تغيير الصفحة أو حجم الصفحة
  useEffect(() => {
    if (didInit.current) {
      fetchUsers(false);
    }
  }, [page, pageSize, fetchUsers]);

  // حساب الإحصائيات عند تغيير البيانات
  useEffect(() => {
    if (rows.length > 0) {
      const calculatedStats = {
        total: rows.length,
        active: rows.filter(u => u.isActive !== false).length,
        admins: rows.filter(u => u.role === 'ADMIN' || u.adminRole !== null).length,
        staff: rows.filter(u => u.role === 'STAFF').length,
        users: rows.filter(u => u.role === 'USER').length,
        viewers: rows.filter(u => u.role === 'VIEWER').length,
      };
      setStats(calculatedStats);
    }
  }, [rows]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(true, undefined, q);
  };

  const onType = (val: string) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(true, undefined, val);
    }, 400);
  };

  const onRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
    fetchUsers(true, val, undefined);
  };

  const onStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
    fetchUsers(true, undefined, undefined, val);
  };

  const changeRole = async (id: string, newRoleValue: string) => {
    let roleToSave = 'USER';
    let adminRoleIdToSave = '';

    if (['ADMIN', 'STAFF', 'VIEWER', 'USER'].includes(newRoleValue)) {
      roleToSave = newRoleValue;
    } else {
      roleToSave = 'STAFF'; // Default base role for custom roles
      adminRoleIdToSave = newRoleValue;
    }

    const form = new FormData();
    form.append('role', roleToSave);
    if (adminRoleIdToSave) {
      form.append('adminRoleId', adminRoleIdToSave);
    }
    const res = await fetch(`/api/admin/users/${id}/role`, { method: 'POST', body: form });
    if (res.ok) {
      fetchUsers(false);
      fetchStats();
      showMessage('تم تحديث دور المستخدم بنجاح! ✨', true);
    } else {
      showMessage('حدث خطأ في تحديث دور المستخدم', false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    const form = new FormData();
    form.append('isActive', String(!currentStatus));
    const res = await fetch(`/api/admin/users/${id}/status`, { method: 'POST', body: form });
    if (res.ok) {
      fetchUsers(false);
      fetchStats();
      showMessage('تم تحديث حالة المستخدم بنجاح! 🔄', true);
    } else {
      showMessage('حدث خطأ في تحديث حالة المستخدم', false);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers(false);
        fetchStats();
        showMessage('تم حذف المستخدم بنجاح! 🗑️', true);
      } else {
        showMessage('حدث خطأ في حذف المستخدم', false);
      }
    }
  };

  const showMessage = (text: string, isSuccess: boolean = true) => {
    setMessage(text);
    if (isSuccess) {
      setShowSuccessMessage(true);
      setShowErrorMessage(false);
    } else {
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
    }

    // إخفاء الرسالة بعد 4 ثوان
    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowErrorMessage(false);
    }, 4000);
  };

  const viewUserDetails = (user: UserRow) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      adminRoleId: user.adminRoleId || '',
      isActive: user.isActive !== false,
      newPassword: '', // إعادة تعيين كلمة المرور عند فتح المودال
    });
    setIsEditing(false);
    setShowUserModal(true);
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const form = new FormData();
      form.append('name', editForm.name);
      form.append('email', editForm.email);
      form.append('phone', editForm.phone);
      form.append('role', editForm.role);
      form.append('adminRoleId', editForm.adminRoleId);

      // إضافة كلمة المرور الجديدة إذا تم إدخالها
      if (editForm.newPassword) {
        form.append('password', editForm.newPassword);
      }

      // isActive غير مدعوم حالياً في الـ API
      // form.append("isActive", String(editForm.isActive));

      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'PUT',
        body: form,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          fetchUsers(false);
          fetchStats();
          setIsEditing(false);
          showMessage('تم تحديث المستخدم بنجاح! 🎉', true);
        } else {
          showMessage('حدث خطأ في تحديث المستخدم', false);
        }
      } else {
        const errorData = await res.json();
        showMessage(errorData.error || 'حدث خطأ في تحديث المستخدم', false);
      }
    } catch (error) {
      //
      // showMessage('حدث خطأ في تحديث المستخدم', false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5'></div>
          <div className='relative flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
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
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  إدارة المستخدمين
                </h1>
                <p className='text-gray-600 mt-2 text-lg'>إدارة وتتبع جميع المستخدمين في النظام</p>
                {(q || role || status) && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <span className='text-sm text-gray-500'>التصفية:</span>
                    {q && (
                      <span className='px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200'>
                        البحث: &quot;{q}&quot;
                      </span>
                    )}
                    {role && (
                      <span className='px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200'>
                        الدور: {role}
                      </span>
                    )}
                    {status && (
                      <span className='px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200'>
                        الحالة: {status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/admin/users/create'
                className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                إضافة مشرف جديد
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>إجمالي المستخدمين</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>نشط</p>
                <p className='text-2xl font-bold text-green-600'>{stats.active}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
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
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>مديرين</p>
                <p className='text-2xl font-bold text-red-600'>{stats.admins}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
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
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>موظفين</p>
                <p className='text-2xl font-bold text-yellow-600'>{stats.staff}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>مستخدمين</p>
                <p className='text-2xl font-bold text-blue-600'>{stats.users}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
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
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>مشاهدين</p>
                <p className='text-2xl font-bold text-purple-600'>{stats.viewers}</p>
              </div>
              <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* تصنيف المستخدمين */}
        <div className='bg-white rounded-xl p-6 shadow-xl border border-gray-100'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
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
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>تقسيمات المستخدمين</h2>
              <p className='text-gray-600 text-sm'>تصفح المستخدمين حسب النوع</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button
              onClick={() => {
                setRole('');
                setQ('');
                setActiveFilter('createdBy:null');
                fetchUsers(true, '', 'createdBy:null');
              }}
              className={`px-6 py-4 rounded-xl font-semibold border transition-all duration-200 flex items-center gap-3 ${
                activeFilter === 'createdBy:null'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border-blue-300 shadow-md'
                  : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-800 border-blue-200 hover:shadow-md'
              }`}
            >
              <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-white'
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
              عملاء أونلاين
            </button>
            <button
              onClick={() => {
                setRole('');
                setQ('');
                setActiveFilter('createdBy:admin');
                fetchUsers(true, '', 'createdBy:admin');
              }}
              className={`px-6 py-4 rounded-xl font-semibold border transition-all duration-200 flex items-center gap-3 ${
                activeFilter === 'createdBy:admin'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-green-300 shadow-md'
                  : 'bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-800 border-green-200 hover:shadow-md'
              }`}
            >
              <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              عملاء المكتب
            </button>
            <button
              onClick={() => onRoleChange('MANAGEMENT')}
              className='px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-purple-800 font-semibold border border-purple-200 hover:shadow-md transition-all duration-200 flex items-center gap-3'
            >
              <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-white'
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
              المشرفين
            </button>
          </div>
          <p className='text-xs text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200'>
            <strong>عملاء المكتب:</strong> المستخدمون بدور USER الذين لديهم createdByAdminId (تم
            إنشاؤهم بواسطة المشرفين)
          </p>
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-xl p-6 shadow-xl border border-gray-100'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
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
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>البحث والتصفية</h2>
              <p className='text-gray-600 text-sm'>ابحث عن المستخدمين وصفهم حسب المعايير</p>
            </div>
          </div>
          <form
            onSubmit={onSearchSubmit}
            className='flex flex-col lg:flex-row items-stretch lg:items-center gap-4'
          >
            <div className='flex-1 relative'>
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <input
                value={q}
                onChange={e => onType(e.target.value)}
                placeholder={
                  activeFilter
                    ? activeFilter === 'createdBy:null'
                      ? 'ابحث في عملاء أونلاين...'
                      : activeFilter === 'createdBy:admin'
                        ? 'ابحث في عملاء المكتب...'
                        : 'ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف...'
                    : 'ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف...'
                }
                className='w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-all duration-200'
              />
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <select
                value={role}
                onChange={e => onRoleChange(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 min-w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              >
                <option value=''>كل الأدوار</option>
                <option value='ADMIN'>مدير</option>
                <option value='STAFF'>موظف</option>
                <option value='USER'>مستخدم</option>
                <option value='VIEWER'>مشاهد</option>
              </select>
              <select
                value={status}
                onChange={e => onStatusChange(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 min-w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              >
                <option value=''>كل الحالات</option>
                <option value='active'>نشط</option>
                <option value='inactive'>غير نشط</option>
              </select>
              {activeFilter && (
                <button
                  type='button'
                  onClick={() => {
                    setActiveFilter('');
                    setQ('');
                    fetchUsers(true, '', '', status);
                  }}
                  className='px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 flex items-center gap-2'
                  title='إلغاء الفلتر'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                  إلغاء الفلتر
                </button>
              )}
              <button
                type='submit'
                className='px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                بحث
              </button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className='bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center'>
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
                    d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>قائمة المستخدمين</h2>
                <p className='text-gray-600 text-sm'>عرض وإدارة جميع المستخدمين في النظام</p>
              </div>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0'>
                <tr>
                  <th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    المستخدم
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    الدور
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    الحالة
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    تاريخ الإنشاء
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        <span className='mr-3 text-gray-500'>جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center text-gray-500'>
                      <div className='flex flex-col items-center'>
                        <svg
                          className='w-12 h-12 text-gray-300 mb-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                          />
                        </svg>
                        <p className='text-lg font-medium'>لا توجد نتائج</p>
                        <p className='text-sm'>
                          {activeFilter === 'createdBy:null'
                            ? 'لا يوجد عملاء أونلاين'
                            : activeFilter === 'createdBy:admin'
                              ? 'لا يوجد عملاء مكتب'
                              : 'جرب تغيير معايير البحث'}
                        </p>
                        {activeFilter && (
                          <button
                            onClick={() => {
                              setQ('');
                              setRole('');
                              setActiveFilter('');
                              fetchUsers(true, '', '');
                            }}
                            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                          >
                            عرض جميع المستخدمين
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map(u => (
                    <tr
                      key={u.id}
                      className='hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100'
                    >
                      <td className='px-6 py-6'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-12 w-12'>
                            <div className='h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg'>
                              <span className='text-lg font-bold text-white'>
                                {u.name?.charAt(0)?.toUpperCase() ||
                                  u.email?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className='mr-4'>
                            {/* Badge: Office vs Online */}
                            <div className='mb-2'>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                  u.createdByAdminId
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }`}
                              >
                                {u.createdByAdminId ? '🏢 عميل مكتب' : '🌐 عميل أونلاين'}
                              </span>
                            </div>
                            <div className='text-lg font-bold text-gray-900'>
                              {u.name || 'بدون اسم'}
                            </div>
                            <div className='text-sm text-gray-600'>{u.email}</div>
                            {u.phone && (
                              <div className='text-xs text-gray-500 mt-1'>📞 {u.phone}</div>
                            )}
                            {u.adminRole && (
                              <div className='text-xs font-bold text-indigo-600 mt-1'>
                                ⭐ رتبة الإدارة: {u.adminRole.name}
                              </div>
                            )}
                            {u.createdByAdmin && (
                              <div className='text-xs text-gray-600 mt-2 bg-gray-50 px-2 py-1 rounded-lg'>
                                أضيف بواسطة:{' '}
                                <span className='font-semibold text-blue-600'>
                                  {u.createdByAdmin.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-6 whitespace-nowrap'>
                        <select
                          defaultValue={u.adminRoleId || u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          className='border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200'
                        >
                          <optgroup label='أدوار النظام الأساسية'>
                            <option value='USER'>👤 مستخدم</option>
                            <option value='ADMIN'>👑 مدير نظام</option>
                          </optgroup>
                          {adminRoles.length > 0 && (
                            <optgroup label='رتب مخصصة'>
                              {adminRoles.map(r => (
                                <option key={r.id} value={r.id}>
                                  ⭐ {r.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </td>
                      <td className='px-6 py-6 whitespace-nowrap'>
                        <button
                          onClick={() => toggleUserStatus(u.id, u.isActive || true)}
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                            u.isActive !== false
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              u.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          {u.isActive !== false ? '✅ نشط' : '❌ غير نشط'}
                        </button>
                      </td>
                      <td className='px-6 py-6 whitespace-nowrap text-sm text-gray-600'>
                        <div className='bg-gray-50 px-3 py-2 rounded-lg border border-gray-200'>
                          {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className='px-6 py-6 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => viewUserDetails(u)}
                            className='text-blue-600 hover:text-blue-900 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md'
                            title='عرض التفاصيل'
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
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                          </button>
                          <Link
                            href={`/admin/orders?userId=${u.id}`}
                            className='text-indigo-600 hover:text-indigo-900 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md'
                            title='عرض طلبات هذا المستخدم'
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
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className='text-red-600 hover:text-red-900 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md'
                            title='حذف المستخدم'
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
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className='bg-white rounded-xl p-6 shadow-xl border border-gray-100'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3 text-sm text-gray-600'>
              <span className='font-medium'>عدد العناصر في الصفحة:</span>
              <select
                value={pageSize}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  setPageSize(v);
                  setPage(1);
                }}
                className='border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200'
              >
                {[5, 10, 20, 30, 50].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-center gap-3'>
              <button
                disabled={page <= 1 || loading}
                onClick={() => {
                  const np = Math.max(1, page - 1);
                  setPage(np);
                }}
                className='px-6 py-3 rounded-xl border border-gray-300 text-sm disabled:opacity-50 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2'
              >
                {loading && page > 1 ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600'></div>
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                    السابق
                  </>
                )}
              </button>
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200'>
                <span className='text-sm font-medium text-blue-800'>
                  صفحة {page} من {totalPages}
                </span>
              </div>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => {
                  const np = Math.min(totalPages, page + 1);
                  setPage(np);
                }}
                className='px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm disabled:opacity-50 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2'
              >
                {loading && page < totalPages ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    التالي
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 user-modal'
          onClick={() => setShowUserModal(false)}
        >
          <div
            className='bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-bold text-gray-900'>تفاصيل المستخدم</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
                    <span className='text-xl font-bold text-white'>
                      {(isEditing ? editForm.name : selectedUser.name)?.charAt(0)?.toUpperCase() ||
                        selectedUser.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex-1'>
                    {isEditing ? (
                      <input
                        type='text'
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black'
                        placeholder='اسم المستخدم'
                      />
                    ) : (
                      <h4 className='text-lg font-semibold text-gray-900'>
                        {selectedUser.name || 'بدون اسم'}
                      </h4>
                    )}
                    {isEditing ? (
                      <input
                        type='email'
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        className='w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black'
                        placeholder='البريد الإلكتروني'
                      />
                    ) : (
                      <p className='text-gray-600'>{selectedUser.email}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2 md:col-span-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      الدور / الرتبة
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.adminRoleId || editForm.role}
                        onChange={e => {
                          const val = e.target.value;
                          if (['ADMIN', 'STAFF', 'VIEWER', 'USER'].includes(val)) {
                            setEditForm({ ...editForm, role: val, adminRoleId: '' });
                          } else {
                            setEditForm({ ...editForm, role: 'STAFF', adminRoleId: val });
                          }
                        }}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black'
                      >
                        <optgroup label='أدوار النظام الأساسية'>
                          <option value='USER'>مستخدم</option>
                          <option value='ADMIN'>مدير نظام</option>
                        </optgroup>
                        {adminRoles.length > 0 && (
                          <optgroup label='رتب مخصصة'>
                            {adminRoles.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    ) : (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                        {selectedUser.adminRole?.name || selectedUser.role}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>الحالة</label>
                    {isEditing ? (
                      <select
                        value={editForm.isActive ? 'active' : 'inactive'}
                        onChange={e =>
                          setEditForm({ ...editForm, isActive: e.target.value === 'active' })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black'
                      >
                        <option value='active'>نشط</option>
                        <option value='inactive'>غير نشط</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.isActive !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedUser.isActive !== false ? 'نشط' : 'غير نشط'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type='tel'
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black'
                      placeholder='رقم الهاتف'
                    />
                  ) : (
                    <p className='text-gray-900'>{selectedUser.phone || 'غير محدد'}</p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    تاريخ الإنشاء
                  </label>
                  <p className='text-gray-900'>
                    {new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>

                {selectedUser.lastLogin && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      آخر تسجيل دخول
                    </label>
                    <p className='text-gray-900'>
                      {new Date(selectedUser.lastLogin).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}

                {selectedUser.ordersCount !== undefined && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      عدد الطلبات
                    </label>
                    <p className='text-gray-900'>{selectedUser.ordersCount}</p>
                  </div>
                )}
              </div>

              {/* Password Reset Field - Only show when editing */}
              {isEditing && (
                <div className='mt-6 pt-6 border-t border-gray-100'>
                  <h3 className='text-sm font-bold text-gray-900 mb-4 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-amber-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                      />
                    </svg>
                    تغيير كلمة المرور
                  </h3>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      كلمة المرور الجديدة (اختياري)
                    </label>
                    <input
                      type='text'
                      value={editForm.newPassword || ''}
                      onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left'
                      dir='ltr'
                      placeholder='اتركه فارغاً إذا لم ترد التغيير'
                      autoComplete='new-password'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      أدخل 4 أحرف على الأقل لتغيير كلمة المرور.
                    </p>
                  </div>
                </div>
              )}

              <div className='flex gap-3 mt-6'>
                {isEditing ? (
                  <>
                    <button
                      onClick={updateUser}
                      className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                    >
                      حفظ التغييرات
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // إعادة تعيين النموذج للقيم الأصلية
                        setEditForm({
                          name: selectedUser.name || '',
                          email: selectedUser.email || '',
                          phone: selectedUser.phone || '',
                          role: selectedUser.role || '',
                          adminRoleId: selectedUser.adminRoleId || '',
                          isActive: selectedUser.isActive !== false,
                          newPassword: '',
                        });
                      }}
                      className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      إغلاق
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className='fixed top-4 right-4 z-[10000] animate-slide-in'>
          <div className='bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 flex items-center gap-3 max-w-md'>
            <div className='flex-shrink-0'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='font-semibold text-sm'>{message}</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className='flex-shrink-0 text-green-200 hover:text-white transition-colors'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className='fixed top-4 right-4 z-[10000] animate-slide-in'>
          <div className='bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-red-400 flex items-center gap-3 max-w-md'>
            <div className='flex-shrink-0'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='font-semibold text-sm'>{message}</p>
            </div>
            <button
              onClick={() => setShowErrorMessage(false)}
              className='flex-shrink-0 text-red-200 hover:text-white transition-colors'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
