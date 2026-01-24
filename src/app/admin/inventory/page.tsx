'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Service = { id: string; name: string; slug: string; variants: { id: string; name: string }[] };
type FormType = { id: string; name: string; description?: string | null; active: boolean };

export default function InventoryPage() {
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
  const [_activeTab, _setActiveTab] = useState<'links' | 'serials'>('links');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedFormType = useMemo(
    () => formTypes.find(f => f.id === selectedFormTypeId) || null,
    [formTypes, selectedFormTypeId]
  );
  const displayedFormTypes = useMemo(() => {
    return [...formTypes].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [formTypes]);
  const displayedServices = useMemo(() => {
    return [...services]
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
      if (a.consumed !== b.consumed) return a.consumed ? -1 : 1; // المستخدمة أولاً
      const an = toNumber(a.serialNumber);
      const bn = toNumber(b.serialNumber);
      if (an !== bn) return an - bn; // تصاعدي بالأرقام
      //fallback by createdAt desc
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

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

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
                    d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  إدارة العهدة
                </h1>
                <p className='text-gray-600 mt-2 text-lg'>
                  إدارة ربط الأنواع بالأصناف وأرقام الاستمارات
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/admin/create'
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
                إنشاء طلب جديد
              </Link>
            </div>
          </div>
        </div>

        {/* Form Types Selector */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-6 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
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
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-bold text-white mb-1'>أنواع الاستمارات</h2>
                <p className='text-blue-100 text-sm'>اختر نوع الاستمارة للعمل عليه</p>
              </div>
            </div>
          </div>
          <div className='p-6'>
            <div className='flex flex-wrap gap-3'>
              {displayedFormTypes.map(ft => {
                const active = selectedFormTypeId === ft.id;
                return (
                  <button
                    key={ft.id}
                    type='button'
                    onClick={() => setSelectedFormTypeId(ft.id)}
                    className={`px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                    }`}
                    title={ft.description || ft.name}
                  >
                    {active && (
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    )}
                    {ft.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          {/* Left Side - ربط الأنواع */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-emerald-500 to-green-600 p-6 border-b border-gray-100'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
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
                        d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-xl font-bold text-white'>ربط الأنواع</h2>
                    <p className='text-emerald-100 text-sm'>
                      ربط {selectedFormType?.name || '-'} بأنواع الخدمة
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  disabled={savingLinks}
                  onClick={saveLinks}
                  className='px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 disabled:opacity-60 transition-all duration-200 font-medium shadow-lg hover:shadow-xl border border-white/20'
                >
                  {savingLinks ? (
                    <div className='flex items-center gap-2'>
                      <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      جارٍ الحفظ...
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      حفظ الربط
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div className='p-6'>
              <div className='max-h-[70vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                {displayedServices.map(svc => (
                  <div
                    key={svc.id}
                    className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200'
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center'>
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
                            d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                          />
                        </svg>
                      </div>
                      <h3 className='font-bold text-gray-900 text-lg'>{svc.name}</h3>
                    </div>
                    <div className='space-y-2'>
                      {svc.variants.map(v => (
                        <label
                          key={v.id}
                          className='flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-all duration-200 cursor-pointer group border border-transparent hover:border-emerald-200'
                        >
                          <input
                            type='checkbox'
                            checked={linkedVariantIds.includes(v.id)}
                            onChange={() => toggleVariant(v.id)}
                            className='w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 transition-all duration-200'
                          />
                          <span className='text-gray-900 font-medium group-hover:text-emerald-700 transition-colors duration-200'>
                            {v.name}
                          </span>
                          {linkedVariantIds.includes(v.id) && (
                            <div className='ml-auto'>
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
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - أرقام الاستمارات */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-purple-500 to-pink-600 p-6 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
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
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>أرقام الاستمارات</h2>
                  <p className='text-purple-100 text-sm'>
                    إدارة أرقام {selectedFormType?.name || '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className='p-6 space-y-6'>
              {/* Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200'>
                  <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                  <div className='text-sm text-blue-700 font-medium'>الإجمالي</div>
                  <div className='text-2xl font-bold text-blue-800'>{stats.total}</div>
                </div>
                <div className='bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200'>
                  <div className='w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                  </div>
                  <div className='text-sm text-red-700 font-medium'>المستخدم</div>
                  <div className='text-2xl font-bold text-red-800'>{stats.used}</div>
                </div>
                <div className='bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200'>
                  <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div className='text-sm text-green-700 font-medium'>المتاح</div>
                  <div className='text-2xl font-bold text-green-800'>{stats.available}</div>
                </div>
              </div>

              {/* Search */}
              <div className='relative'>
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
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder='بحث برقم الاستمارة...'
                  className='w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200'
                />
              </div>

              {/* Add New Serials */}
              <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center'>
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
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                  </div>
                  <label className='block text-sm font-bold text-gray-900'>أدخل أرقام جديدة</label>
                </div>
                <textarea
                  value={newSerialsText}
                  onChange={e => setNewSerialsText(e.target.value)}
                  className='w-full min-h-[120px] border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all duration-200'
                  placeholder='مثال:&#10;123456&#10;123457&#10;123458&#10;...'
                />
                <button
                  type='button'
                  disabled={addingSerials}
                  onClick={addSerials}
                  className='mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-60 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2'
                >
                  {addingSerials ? (
                    <>
                      <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      جارٍ الإضافة...
                    </>
                  ) : (
                    <>
                      <svg
                        className='w-4 h-4'
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
                      إضافة الأرقام
                    </>
                  )}
                </button>
              </div>

              {/* Serials List */}
              <div className='border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
                <div className='overflow-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                  {serialsLoading ? (
                    <div className='p-8 text-center text-gray-600'>
                      <svg
                        className='animate-spin w-8 h-8 mx-auto mb-4 text-purple-600'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      جاري التحميل...
                    </div>
                  ) : filteredSerials.length === 0 ? (
                    <div className='p-8 text-center text-gray-600'>
                      <div className='text-4xl mb-4'>📋</div>
                      <p>لا توجد أرقام</p>
                    </div>
                  ) : (
                    <table className='w-full'>
                      <thead className='bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0'>
                        <tr>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>
                            رقم الاستمارة
                          </th>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>الحالة</th>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>
                            أضيف بواسطة
                          </th>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>
                            وقت الإضافة
                          </th>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>
                            استخدم بواسطة
                          </th>
                          <th className='text-right px-4 py-3 font-bold text-gray-900'>
                            وقت الاستخدام
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-100'>
                        {filteredSerials.map((s: any) => (
                          <tr
                            key={s.id}
                            className={`hover:bg-gray-50 transition-colors duration-200 ${s.consumed ? 'bg-red-50/50' : 'bg-white'}`}
                          >
                            <td className='px-4 py-3 font-mono text-gray-900 font-bold text-lg'>
                              {s.serialNumber}
                            </td>
                            <td className='px-4 py-3'>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  s.consumed
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                }`}
                              >
                                {s.consumed ? '❌ مستهلك' : '✅ متاح'}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-gray-900 font-medium'>
                              {s.addedByAdmin?.name || s.addedByAdmin?.email || '-'}
                            </td>
                            <td className='px-4 py-3 text-gray-900'>
                              {s.createdAt
                                ? new Date(s.createdAt).toLocaleDateString('ar-EG')
                                : '-'}
                            </td>
                            <td className='px-4 py-3 text-gray-900 font-medium'>
                              {s.consumedByAdmin?.name || s.consumedByAdmin?.email || '-'}
                            </td>
                            <td className='px-4 py-3 text-gray-900'>
                              {s.consumedAt
                                ? new Date(s.consumedAt).toLocaleDateString('ar-EG')
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
