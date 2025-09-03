"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

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
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, admins: 0, staff: 0, users: 0, viewers: 0 });
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
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
    isActive: true
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState('');
  const didInit = useRef(false);
  const debounceRef = useRef<any>(null);

  const fetchUsers = async (resetPage?: boolean, nextRole?: string, nextQ?: string, nextStatus?: string) => {
    setLoading(true);
    try {
      const targetPage = resetPage ? 1 : page;
      const effectiveRole = typeof nextRole === "string" ? nextRole : role;
      const effectiveQ = typeof nextQ === "string" ? nextQ : q;
      const effectiveStatus = typeof nextStatus === "string" ? nextStatus : status;
      const params = new URLSearchParams();
      if (effectiveQ) params.set("q", effectiveQ);
      if (effectiveRole) params.set("role", effectiveRole);
      if (effectiveStatus) params.set("status", effectiveStatus);
      params.set("page", String(targetPage));
      params.set("pageSize", String(pageSize));
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
  };

  const fetchStats = async () => {
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
          admins: rows.filter(u => u.role === 'ADMIN').length,
          staff: rows.filter(u => u.role === 'STAFF').length,
          users: rows.filter(u => u.role === 'USER').length,
          viewers: rows.filter(u => u.role === 'VIEWER').length
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // في حالة الخطأ، احسب الإحصائيات من البيانات الموجودة
      const calculatedStats = {
        total: rows.length,
        active: rows.filter(u => u.isActive !== false).length,
        admins: rows.filter(u => u.role === 'ADMIN').length,
        staff: rows.filter(u => u.role === 'STAFF').length,
        users: rows.filter(u => u.role === 'USER').length,
        viewers: rows.filter(u => u.role === 'VIEWER').length
      };
      setStats(calculatedStats);
    }
  };

  useEffect(() => { 
    if (!didInit.current) { 
      didInit.current = true; 
      fetchUsers(true); 
      fetchStats();
    } 
  }, []);
  
  // تحميل البيانات عند تغيير الصفحة أو حجم الصفحة
  useEffect(() => { 
    if (didInit.current) {
      fetchUsers(false); 
    }
  }, [page, pageSize]);
  
  // حساب الإحصائيات عند تغيير البيانات
  useEffect(() => {
    if (rows.length > 0) {
      const calculatedStats = {
        total: rows.length,
        active: rows.filter(u => u.isActive !== false).length,
        admins: rows.filter(u => u.role === 'ADMIN').length,
        staff: rows.filter(u => u.role === 'STAFF').length,
        users: rows.filter(u => u.role === 'USER').length,
        viewers: rows.filter(u => u.role === 'VIEWER').length
      };
      setStats(calculatedStats);
    }
  }, [rows]);

  const onSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(true, undefined, q); };

  const onType = (val: string) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchUsers(true, undefined, val); }, 400);
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

  const changeRole = async (id: string, newRole: string) => {
    const form = new FormData();
    form.append("role", newRole);
    const res = await fetch(`/api/admin/users/${id}/role`, { method: "POST", body: form });
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
    form.append("isActive", String(!currentStatus));
    const res = await fetch(`/api/admin/users/${id}/status`, { method: "POST", body: form });
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
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
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
      isActive: user.isActive !== false
    });
    setIsEditing(false);
    setShowUserModal(true);
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const form = new FormData();
      form.append("name", editForm.name);
      form.append("email", editForm.email);
      form.append("phone", editForm.phone);
      form.append("role", editForm.role);
      // isActive غير مدعوم حالياً في الـ API
      // form.append("isActive", String(editForm.isActive));
      
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, { 
        method: "PUT", 
        body: form 
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
      console.error('Error updating user:', error);
      showMessage('حدث خطأ في تحديث المستخدم', false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 admin-panel">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
            <p className="text-gray-600">إدارة وتتبع جميع المستخدمين في النظام</p>
            {(q || role || status) && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">التصفية:</span>
                {q && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">البحث: "{q}"</span>}
                {role && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">الدور: {role}</span>}
                {status && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">الحالة: {status === 'active' ? 'نشط' : 'غير نشط'}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نشط</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مديرين</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">موظفين</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.staff}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مستخدمين</p>
                <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مشاهدين</p>
                <p className="text-2xl font-bold text-purple-600">{stats.viewers}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={onSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            <div className="flex-1">
              <input 
                value={q} 
                onChange={(e) => onType(e.target.value)} 
                placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400" 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={role} onChange={(e)=> onRoleChange(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 min-w-[140px]">
                <option value="">كل الأدوار</option>
                <option value="ADMIN">مدير</option>
                <option value="STAFF">موظف</option>
                <option value="USER">مستخدم</option>
                <option value="VIEWER">مشاهد</option>
              </select>
              <select value={status} onChange={(e)=> onStatusChange(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 min-w-[140px]">
                <option value="">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
              <button type="submit" className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                بحث
              </button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden admin-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="mr-3 text-gray-500">جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-lg font-medium">لا توجد نتائج</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {u.name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{u.name || 'بدون اسم'}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                            {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          defaultValue={u.role} 
                          onChange={(e) => changeRole(u.id, e.target.value)} 
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="USER">مستخدم</option>
                          <option value="VIEWER">مشاهد</option>
                          <option value="STAFF">موظف</option>
                          <option value="ADMIN">مدير</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(u.id, u.isActive || true)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            u.isActive !== false 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            u.isActive !== false ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          {u.isActive !== false ? 'نشط' : 'غير نشط'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewUserDetails(u)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="حذف المستخدم"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>عدد العناصر في الصفحة:</span>
            <select 
              value={pageSize} 
              onChange={(e) => { 
                const v = parseInt(e.target.value); 
                setPageSize(v); 
                setPage(1); 
              }} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[5,10,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page<=1 || loading} 
              onClick={() => { const np = Math.max(1, page-1); setPage(np); }} 
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {loading && page > 1 ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  جاري التحميل...
                </div>
              ) : (
                'السابق'
              )}
            </button>
            <span className="text-sm text-gray-700 px-3">صفحة {page} من {totalPages}</span>
            <button 
              disabled={page>=totalPages || loading} 
              onClick={() => { const np = Math.min(totalPages, page+1); setPage(np); }} 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {loading && page < totalPages ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحميل...
                </div>
              ) : (
                'التالي'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 user-modal"
          onClick={() => setShowUserModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تفاصيل المستخدم</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {(isEditing ? editForm.name : selectedUser.name)?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="اسم المستخدم"
                      />
                    ) : (
                      <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name || 'بدون اسم'}</h4>
                    )}
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="البريد الإلكتروني"
                      />
                    ) : (
                      <p className="text-gray-600">{selectedUser.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="USER">مستخدم</option>
                        <option value="VIEWER">مشاهد</option>
                        <option value="STAFF">موظف</option>
                        <option value="ADMIN">مدير</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {selectedUser.role}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    {isEditing ? (
                      <select
                        value={editForm.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.isActive !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isActive !== false ? 'نشط' : 'غير نشط'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="رقم الهاتف"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedUser.phone || 'غير محدد'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>

                {selectedUser.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">آخر تسجيل دخول</label>
                    <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleDateString('ar-EG')}</p>
                  </div>
                )}

                {selectedUser.ordersCount !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد الطلبات</label>
                    <p className="text-gray-900">{selectedUser.ordersCount}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={updateUser}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                          isActive: selectedUser.isActive !== false
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="fixed top-4 right-4 z-[10000] animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 flex items-center gap-3 max-w-md">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{message}</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-[10000] animate-slide-in">
          <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-red-400 flex items-center gap-3 max-w-md">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{message}</p>
            </div>
            <button
              onClick={() => setShowErrorMessage(false)}
              className="flex-shrink-0 text-red-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
