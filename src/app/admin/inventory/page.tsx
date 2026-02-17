'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Service = { id: string; name: string; slug: string; variants: { id: string; name: string }[] };
type FormType = { id: string; name: string; description?: string | null; active: boolean };

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [selectedFormTypeId, setSelectedFormTypeId] = useState<string>('');
  const [linkedVariantIds, setLinkedVariantIds] = useState<string[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [serialsLoading, setSerialsLoading] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [addingSerials, setAddingSerials] = useState(false);
  const [newSerialsText, setNewSerialsText] = useState('');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedFormType = useMemo(
    () => formTypes.find(f => f.id === selectedFormTypeId) || null,
    [formTypes, selectedFormTypeId]
  );

  const displayedFormTypes = useMemo(() => {
    return [...formTypes].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [formTypes]);

  // Filter ONLY National ID / Card related services
  const displayedServices = useMemo(() => {
    return services
      .filter(s => (s.name.includes('قومي') || s.name.includes('بطاقة')) && !s.name.includes('مترجم') && !s.name.includes('تصحيح'))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map(svc => ({
        ...svc,
        variants: [...svc.variants].sort((a, b) => a.name.localeCompare(b.name, 'ar')),
      }));
  }, [services]);

  const filteredSerials = useMemo(() => {
    const byQuery = !search
      ? serials
      : serials.filter((s: any) =>
          `${s.serialNumber}`.toLowerCase().includes(search.toLowerCase())
        );
    const toNumber = (v: any) => {
      const n = parseInt(String(v || '').replace(/\D+/g, ''));
      return isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    };
    return [...byQuery].sort((a: any, b: any) => {
      if (a.consumed !== b.consumed) return a.consumed ? -1 : 1; // Used first? Or available first?
      // Let's show Available first usually, but user logic was used first.
      // logic: consumed=true (1), consumed=false (0). 1 > 0.
      // if a.consumed (true) and b.consumed (false) -> return -1 puts a first.
      // So used first.
      const an = toNumber(a.serialNumber);
      const bn = toNumber(b.serialNumber);
      if (an !== bn) return an - bn; 
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [serials, search]);

  const stats = useMemo(() => {
    const total = serials.length;
    const used = serials.filter((s: any) => s.consumed).length;
    const available = total - used;
    return { total, used, available };
  }, [serials]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [svcRes, ftRes] = await Promise.all([
          fetch('/api/admin/services', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/admin/forms/types', { cache: 'no-store', credentials: 'include' }),
        ]);
        const svc = await svcRes.json().catch(() => ({}));
        const ft = await ftRes.json().catch(() => ({}));
        if (svc.success) setServices(svc.services);
        if (ft.success && Array.isArray(ft.formTypes)) {
          setFormTypes(ft.formTypes);
          if (ft.formTypes.length > 0) setSelectedFormTypeId(ft.formTypes[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedFormTypeId) return;
      setSerialsLoading(true);
      try {
        const [linksRes, serialsRes] = await Promise.all([
          fetch(`/api/admin/forms/types/${selectedFormTypeId}/links`, { credentials: 'include' }),
          fetch(`/api/admin/forms/types/${selectedFormTypeId}/serials`, { credentials: 'include' }),
        ]);
        const links = await linksRes.json().catch(() => ({}));
        const sers = await serialsRes.json().catch(() => ({}));
        if (links.success && Array.isArray(links.variantIds)) setLinkedVariantIds(links.variantIds);
        if (sers.success && Array.isArray(sers.serials)) setSerials(sers.serials);
      } finally {
        setSerialsLoading(false);
      }
    };
    loadDetails();
  }, [selectedFormTypeId]);

  const toggleVariant = (id: string) => {
    setLinkedVariantIds(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  };

  const saveLinks = async () => {
    if (!selectedFormTypeId) return;
    setSavingLinks(true);
    try {
      await fetch(`/api/admin/forms/types/${selectedFormTypeId}/links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ variantIds: linkedVariantIds }),
      });
    } finally {
      setSavingLinks(false);
    }
  };

  const addSerials = async () => {
    const list = newSerialsText
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    setAddingSerials(true);
    try {
      const res = await fetch(`/api/admin/forms/types/${selectedFormTypeId}/serials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ serials: list }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setNewSerialsText('');
        setSerials(prev => [...data.created, ...prev]);
      }
    } finally {
      setAddingSerials(false);
    }
  };


  const deleteSerial = async (serialId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرقم؟')) return;
    
    // Optimistic update
    const previousSerials = [...serials];
    setSerials(prev => prev.filter(s => s.id !== serialId));

    try {
      const res = await fetch(`/api/admin/forms/types/${selectedFormTypeId}/serials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ serialId }),
      });
      
      if (!res.ok) {
        // Revert if failed
        setSerials(previousSerials);
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      setSerials(previousSerials);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
            <p className="text-slate-500 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 font-sans pb-20'>
      <div className='max-w-[1600px] mx-auto p-6 md:p-8 space-y-8'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-3xl p-8 shadow-sm border border-slate-100'>
            <div className='flex items-center gap-6'>
                <div className='w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100'>
                    <svg className='w-10 h-10 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
                    </svg>
                </div>
                <div>
                    <h1 className='text-3xl font-black text-slate-900 tracking-tight mb-2'>إدارة العهدة والاستمارات</h1>
                    <p className='text-slate-500 text-lg font-medium'>إدارة المخزون وربط الاستمارات بالخدمات (بطاقات الرقم القومي)</p>
                </div>
            </div>
            <Link
                href='/admin/create'
                className='px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3'
            >
                <span>+</span>
                إنشاء طلب جديد
            </Link>
        </div>

        {/* Form Types Tabs */}
        <div className='flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide'>
            {displayedFormTypes.map(ft => {
                const active = selectedFormTypeId === ft.id;
                return (
                    <button
                        key={ft.id}
                        onClick={() => setSelectedFormTypeId(ft.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[200px] ${
                            active 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                    >
                         <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                        </svg>
                        <span className="font-bold whitespace-nowrap">{ft.name}</span>
                    </button>
                );
            })}
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
            {/* Left Col: Mapping (4 cols) */}
            <div className='xl:col-span-4 space-y-6'>
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                     <div className='flex items-center justify-between mb-6 pb-6 border-b border-slate-100'>
                        <h2 className='text-xl font-black text-slate-900 flex items-center gap-2'>
                           🔗 ربط الخدمات
                        </h2>
                        <button
                           onClick={saveLinks}
                           disabled={savingLinks}
                           className='text-xs font-bold px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50'
                        >
                           {savingLinks ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                     </div>

                     <div className='space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar'>
                        {displayedServices.length === 0 ? (
                           <div className="text-center py-10 text-slate-400">
                              لا توجد خدمات &quot;بطاقة رقم قومي&quot; متاحة

                           </div>
                        ) : displayedServices.map(svc => (
                             <div key={svc.id} className='bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:border-emerald-200 transition-all'>
                                 <h3 className='font-bold text-slate-800 mb-3 text-sm'>{svc.name}</h3>
                                 <div className='space-y-2'>
                                     {svc.variants.map(v => (
                                         <label key={v.id} className='flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-emerald-300 transition-all group'>
                                             <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${linkedVariantIds.includes(v.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                 {linkedVariantIds.includes(v.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                             </div>
                                             <input type="checkbox" className="hidden" checked={linkedVariantIds.includes(v.id)} onChange={() => toggleVariant(v.id)} />
                                             <span className={`text-sm font-medium ${linkedVariantIds.includes(v.id) ? 'text-emerald-700' : 'text-slate-600'}`}>{v.name}</span>
                                         </label>
                                     ))}
                                 </div>
                             </div>
                        ))}
                     </div>
                 </div>
            </div>

            {/* Right Col: Inventory Management (8 cols) */}
            <div className='xl:col-span-8 space-y-6'>
                 {/* Stats Cards */}
                 <div className='grid grid-cols-3 gap-4'>
                     <div className='bg-white p-6 rounded-3xl border border-slate-100 shadow-sm'>
                         <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>الإجمالي</p>
                         <p className='text-3xl font-black text-slate-900'>{stats.total}</p>
                     </div>
                     <div className='bg-white p-6 rounded-3xl border border-slate-100 shadow-sm'>
                         <p className='text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2'>المتاح</p>
                         <p className='text-3xl font-black text-emerald-600'>{stats.available}</p>
                     </div>
                     <div className='bg-white p-6 rounded-3xl border border-slate-100 shadow-sm'>
                         <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>المستهلك</p>
                         <p className='text-3xl font-black text-slate-500'>{stats.used}</p>
                     </div>
                 </div>

                 {/* Actions & List */}
                 <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-6 min-h-[600px] flex flex-col'>
                     <div className='flex flex-col md:flex-row gap-4 mb-6'>
                         {/* Add Serials Input */}
                         <div className='flex-1 flex gap-2'>
                             <textarea 
                                value={newSerialsText}
                                onChange={e => setNewSerialsText(e.target.value)}
                                placeholder='أدخل الأرقام (كل رقم في سطر)...'
                                className='flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 min-h-[50px] max-h-[100px] focus:border-emerald-500 focus:ring-0 text-sm font-medium resize-none'
                             />
                             <button 
                                onClick={addSerials}
                                disabled={addingSerials || !newSerialsText.trim()}
                                className='px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                             >
                                {addingSerials ? '...' : '+ إضافة'}
                             </button>
                         </div>
                         {/* Search */}
                         <div className='relative w-full md:w-64'>
                             <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder='بحث...'
                                className='w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20'
                             />
                             <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                             </svg>
                         </div>
                     </div>

                     <div className='flex-1 overflow-hidden border border-slate-100 rounded-2xl'>
                         <div className='overflow-y-auto max-h-[600px] custom-scrollbar'>
                             <table className='w-full text-sm text-right'>
                                 <thead className='bg-slate-50 sticky top-0'>
                                     <tr>
                                         <th className='px-6 py-4 font-bold text-slate-500'>الرقم</th>
                                         <th className='px-6 py-4 font-bold text-slate-500'>الحالة</th>
                                         <th className='px-6 py-4 font-bold text-slate-500'>تاريخ الإضافة</th>
                                         <th className='px-6 py-4 font-bold text-slate-500'>تم الاستهلاك</th>
                                         <th className='px-6 py-4 font-bold text-slate-500'>إجراءات</th>
                                     </tr>
                                 </thead>
                                 <tbody className='divide-y divide-slate-100'>
                                     {serialsLoading ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">جاري التحميل...</td></tr>
                                     ) : filteredSerials.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد بيانات</td></tr>
                                     ) : filteredSerials.map((s: any) => (
                                         <tr key={s.id} className='hover:bg-slate-50 transition-colors'>
                                             <td className='px-6 py-4 font-mono font-bold text-slate-700'>{s.serialNumber}</td>
                                             <td className='px-6 py-4'>
                                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.consumed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                                                     <span className={`w-1.5 h-1.5 rounded-full ${s.consumed ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                                                     {s.consumed ? 'مستهلك' : 'متاح'}
                                                 </span>
                                             </td>
                                             <td className='px-6 py-4 text-slate-500'>
                                                 {s.createdAt ? new Date(s.createdAt).toLocaleDateString('ar-EG') : '-'}
                                             </td>
                                             <td className='px-6 py-4 text-slate-500'>
                                                 {s.consumedAt ? new Date(s.consumedAt).toLocaleDateString('ar-EG') : '-'}
                                             </td>
                                             <td className='px-6 py-4'>
                                                  {!s.consumed && (
                                                      <button 
                                                          onClick={() => deleteSerial(s.id)}
                                                          className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors'
                                                          title="حذف"
                                                      >
                                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                          </svg>
                                                      </button>
                                                  )}
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
