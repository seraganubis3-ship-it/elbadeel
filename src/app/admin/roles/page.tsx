'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';

const AVAILABLE_PERMISSIONS = [
  { id: 'VIEW_DASHBOARD', label: 'الوصول للوحة التحكم' },
  { id: 'CREATE_ORDER', label: 'إنشاء طلب' },
  { id: 'MANAGE_ORDERS', label: 'إدارة الطلبات' },
  { id: 'MANAGE_SERVICES', label: 'إدارة الخدمات' },
  { id: 'MANAGE_USERS', label: 'إدارة المستخدمين' },
  { id: 'MANAGE_INVENTORY', label: 'إدارة العهدة' },
  { id: 'VIEW_REPORTS', label: 'التقارير' },
  { id: 'MANAGE_WHATSAPP', label: 'إدارة رسائل الواتساب' },
  { id: 'MANAGE_PROMOCODES', label: 'أكواد الخصم' },
  { id: 'MANAGE_DELEGATES', label: 'المندوبين' },
  { id: 'MANAGE_WORKORDERS', label: 'أوامر الشغل' },
  { id: 'MANAGE_SETTINGS', label: 'الإعدادات' },
];

export default function RolesManagementPage() {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/users/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (!res.ok) throw new Error('فشل جلب الرتب');
      const data = await res.json();
      setRoles(data);
    } catch (err: any) {
      showError('خطأ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRole(null);
      setName('');
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
  };
  
  const deselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('خطأ', 'يرجى إدخال اسم الرتبة');
      return;
    }
    if (selectedPermissions.length === 0) {
      showError('خطأ', 'يجب اختيار صلاحية واحدة على الأقل');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions: selectedPermissions })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ');
      }

      showSuccess('نجاح', `تم ${editingRole ? 'تحديث' : 'إنشاء'} الرتبة بنجاح`);
      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      showError('خطأ', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, usersCount: number) => {
    if (usersCount > 0) {
      showError('خطأ', 'لا يمكن حذف هذه الرتبة لوجود مستخدمين مرتبطين بها.');
      return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذه الرتبة؟')) return;

    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الحذف');
      }
      showSuccess('نجاح', 'تم حذف الرتبة بنجاح');
      fetchRoles();
    } catch (err: any) {
      showError('خطأ', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6' dir='rtl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-3xl font-black text-slate-800 tracking-tight'>إدارة الرتب والصلاحيات</h1>
          <p className='text-slate-500 mt-1'>إدارة مستويات الوصول وأذونات الموظفين في لوحة التحكم.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className='flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-bold shadow-md shadow-emerald-500/20'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          إضافة رتبة جديدة
        </button>
      </div>

      {/* Roles Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* System Roles */}
        {[
          { id: 'sys-admin', name: 'مدير عام (نظام)', _count: { users: stats?.admins || 0 }, permissions: AVAILABLE_PERMISSIONS.map(p => p.id), isSystem: true },
        ].map(role => (
          <div key={role.id} className='bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                  {role.name}
                  <span className='px-2 py-0.5 bg-slate-200 text-slate-600 outline outline-1 outline-slate-300 rounded text-[10px] font-black'>أساسي</span>
                </h3>
                <span className='inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full mt-2 shadow-sm'>
                  <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
                  </svg>
                  {role._count.users} مستخدم
                </span>
              </div>
            </div>

            <div className='mt-auto pt-4 border-t border-slate-200 text-sm text-slate-500'>
              <div className='font-semibold mb-2'>الصلاحيات المدمجة ({role.permissions.length}):</div>
              <div className='flex flex-wrap gap-1.5'>
                {role.permissions.slice(0, 4).map((pid: string) => {
                  const perm = AVAILABLE_PERMISSIONS.find(p => p.id === pid);
                  return (
                    <span key={pid} className='bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs'>
                      {perm?.label || pid}
                    </span>
                  );
                })}
                {role.permissions.length > 4 && (
                  <span className='bg-transparent text-slate-500 px-2 py-0.5 rounded text-xs border border-dashed border-slate-300'>
                    +{role.permissions.length - 4} أخرى
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Custom Roles */}
        {roles.map(role => (
          <div key={role.id} className='bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-xl font-bold text-slate-800'>{role.name}</h3>
                <span className='inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mt-2'>
                  <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
                  </svg>
                  {role._count.users} مستخدم
                </span>
              </div>
              <div className='flex gap-2 relative z-10'>
                <button
                  onClick={() => handleOpenModal(role)}
                  className='text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(role.id, role._count.users)}
                  className={`p-1.5 rounded-lg transition-colors ${role._count.users > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-slate-50'}`}
                  disabled={role._count.users > 0}
                  title={role._count.users > 0 ? 'لا يمكن حذف الرتبة لوجود مستخدمين' : 'حذف الرتبة'}
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                </button>
              </div>
            </div>

            <div className='mt-auto pt-4 border-t border-slate-100 text-sm text-slate-500'>
              <div className='font-semibold mb-2'>الصلاحيات ({role.permissions.length}):</div>
              <div className='flex flex-wrap gap-1.5'>
                {role.permissions.slice(0, 4).map((pid: string) => {
                  const perm = AVAILABLE_PERMISSIONS.find(p => p.id === pid);
                  return (
                    <span key={pid} className='bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs'>
                      {perm?.label || pid}
                    </span>
                  );
                })}
                {role.permissions.length > 4 && (
                  <span className='bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-xs border border-slate-200'>
                    +{role.permissions.length - 4} أخرى
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className='text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500'>
          <p className='text-lg font-medium'>لم يتم إنشاء أي رتب بعد.</p>
          <p className='text-sm mt-1'>قم بإضافة رتبة جديدة لتخصيص صلاحيات الموظفين.</p>
        </div>
      )}

      {/* Role Form Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
            <div className='p-6 border-b border-slate-100 flex justify-between items-center'>
              <h2 className='text-2xl font-black text-slate-800'>{editingRole ? 'تعديل الرتبة' : 'رتبة جديدة'}</h2>
              <button onClick={() => setIsModalOpen(false)} className='text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg p-2 transition-colors'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            
            <div className='p-6 overflow-y-auto flex-1 space-y-6'>
              <div>
                <label className='block text-sm font-bold text-slate-700 mb-2'>اسم الرتبة</label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='مثال: خدمة العملاء، إدخال بيانات...'
                  className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 font-medium'
                />
              </div>

              <div>
                <div className='flex justify-between items-end mb-4'>
                  <label className='block text-sm font-bold text-slate-700'>الصلاحيات الممنوحة</label>
                  <div className='flex gap-2 text-xs'>
                    <button onClick={selectAll} className='text-emerald-600 font-bold hover:underline py-1 px-2 hover:bg-emerald-50 rounded'>تحديد الكل</button>
                    <button onClick={deselectAll} className='text-slate-500 font-bold hover:underline py-1 px-2 hover:bg-slate-100 rounded'>إلغاء التحديد</button>
                  </div>
                </div>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {AVAILABLE_PERMISSIONS.map(permission => {
                    const isSelected = selectedPermissions.includes(permission.id);
                    return (
                      <div 
                        key={permission.id}
                        onClick={() => togglePermission(permission.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7'/></svg>}
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>{permission.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='p-6 border-t border-slate-100 flex gap-3'>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 flex items-center justify-center'
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ الرتبة'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className='flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold'
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
