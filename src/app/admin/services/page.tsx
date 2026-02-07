'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  isHidden: boolean;
  orderIndex: number;
  category: { name: string };
  variants: any[];
  _count?: {
      orders: number;
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stats
  const [stats, setStats] = useState({
      total: 0,
      active: 0,
      inactive: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let result = services;

    if (query) {
        result = result.filter(s => 
            s.name.includes(query) || 
            s.slug.includes(query) || 
            s.category?.name?.includes(query)
        );
    }

    if (statusFilter) {
        if (statusFilter === 'active') result = result.filter(s => s.active);
        if (statusFilter === 'inactive') result = result.filter(s => !s.active);
    }

    // Always sort by orderIndex
    result.sort((a, b) => a.orderIndex - b.orderIndex);

    setFilteredServices(result);
  }, [services, query, statusFilter]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      if (data.success) {
        const srvs = data.services;
        setServices(srvs);
        setStats({
            total: srvs.length,
            active: srvs.filter((s: Service) => s.active).length,
            inactive: srvs.filter((s: Service) => !s.active).length
        });
      }
    } catch (error) {
      // Error fetching services
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (id: string, visibility: 'PUBLIC' | 'SYSTEM' | 'INACTIVE') => {
    // Determine target state
    const targetState = {
        active: visibility !== 'INACTIVE',
        isHidden: visibility === 'SYSTEM'
    };

    try {
        // Optimistic update
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...targetState } : s));

        const response = await fetch(`/api/admin/services/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetState)
        });
        
        if (!response.ok) {
            // Revert on failure fetches fresh data to be safe
            fetchServices();
        } else {
             // Update stats logic is complex here, simpler to just re-fetch or let optimistic stand
             // for correct stats we might want to re-calc
             const updatedServices = services.map(s => s.id === id ? { ...s, ...targetState } : s);
             setStats({
                total: updatedServices.length,
                active: updatedServices.filter((s: Service) => s.active).length,
                inactive: updatedServices.filter((s: Service) => !s.active).length
            });
        }
    } catch (e) {
         fetchServices();
    }
  };

  const handleOrderChange = async (id: string, newIndex: number) => {
      // Optimistic
      setServices(prev => {
          const updated = prev.map(s => s.id === id ? { ...s, orderIndex: newIndex } : s);
          return [...updated].sort((a, b) => a.orderIndex - b.orderIndex);
      });

      try {
          // We can use the reorder API or just update this single service
          // Reorder API expects an array of { id, orderIndex }
          // But here we might just want to update one. 
          // Let's use the reorder API correctly if we were reordering list, 
          // but for direct input, let's update single service via PATCH/PUT or just reorder API with one item?
          // The reorder API is cleaner.
          await fetch('/api/admin/services/reorder', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [{ id, orderIndex: newIndex }] })
          });
      } catch (error) {
          fetchServices();
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
                  <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                  </svg>
               </div>
               <div>
                 <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                   إدارة الخدمات
                 </h1>
                 <p className='text-gray-600 mt-2 text-lg'>التحكم الكامل في خدمات المنصة وأنواعها</p>
               </div>
             </div>
             
             <div className="flex gap-3">
                <Link
                href='/admin/categories'
                className='px-6 py-3 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl font-bold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2'
                >
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
                </svg>
                <span>إدارة الفئات</span>
                </Link>

                <Link
                href='/admin/services/create'
                className='px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2'
                >
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                <span>إضافة خدمة جديدة</span>
                </Link>
             </div>
           </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
           {/* Total */}
           <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
             <div className='flex items-center justify-between'>
               <div>
                 <p className='text-sm text-gray-600 font-medium'>إجمالي الخدمات</p>
                 <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
               </div>
               <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                 <svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
                 </svg>
               </div>
             </div>
           </div>

           {/* Active */}
           <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
             <div className='flex items-center justify-between'>
               <div>
                 <p className='text-sm text-gray-600 font-medium'>خدمات نشطة</p>
                 <p className='text-2xl font-bold text-emerald-600'>{stats.active}</p>
               </div>
               <div className='w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg'>
                 <svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                 </svg>
               </div>
             </div>
           </div>

           {/* Inactive */}
           <div className='bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105'>
             <div className='flex items-center justify-between'>
               <div>
                 <p className='text-sm text-gray-600 font-medium'>غير نشطة</p>
                 <p className='text-2xl font-bold text-red-600'>{stats.inactive}</p>
               </div>
               <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg'>
                 <svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2' />
                 </svg>
               </div>
             </div>
           </div>
        </div>

        {/* Search & Filter */}
        <div className='bg-white rounded-xl p-6 shadow-xl border border-gray-100'>
             <div className='flex flex-col md:flex-row gap-4'>
                 <div className='flex-1 relative'>
                    <input 
                       type="text" 
                       placeholder="ابحث عن خدمة..." 
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                 </div>
                 <div className='flex gap-2'>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none cursor-pointer font-medium text-gray-700"
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>
                 </div>
             </div>
        </div>

        {/* Content Table */}
        <div className='bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden'>
           <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200'>
               <h2 className='text-xl font-bold text-gray-900'>قائمة الخدمات</h2>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 font-bold text-sm">
                   <tr>
                      <th className="px-6 py-4">الترتيب</th>
                      <th className="px-6 py-4">اسم الخدمة</th>
                      <th className="px-6 py-4">الفئة</th>
                      <th className="px-6 py-4">النوع</th>
                      <th className="px-6 py-4">الحالة</th>
                      <th className="px-6 py-4">إجراءات</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                      [1,2,3].map(i => (
                          <tr key={i} className="animate-pulse">
                              <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-12"></div></td>
                              <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                              <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                              <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                              <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                              <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20"></div></td>
                          </tr>
                      ))
                   ) : filteredServices.length > 0 ? (
                       filteredServices.map(service => (
                          <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                             <td className="px-6 py-4">
                               <input 
                                 type="number"
                                 value={service.orderIndex}
                                 onChange={(e) => handleOrderChange(service.id, parseInt(e.target.value))}
                                 className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                               />
                             </td>
                             <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 text-base">{service.name}</div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">{service.slug}</div>
                             </td>
                             <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                   {service.category?.name || 'بدون فئة'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                                {service.variants.length > 0 ? (
                                    <span className="text-slate-900">{service.variants.length} باقات</span>
                                ) : '0 باقات'}
                             </td>
                             <td className="px-6 py-4">
                                <select
                                   value={!service.active ? 'INACTIVE' : service.isHidden ? 'SYSTEM' : 'PUBLIC'}
                                   onChange={(e) => updateVisibility(service.id, e.target.value as 'PUBLIC' | 'SYSTEM' | 'INACTIVE')}
                                   className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-transparent outline-none cursor-pointer transition-colors ${
                                      !service.active 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : service.isHidden 
                                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                   }`}
                                >
                                   <option value="PUBLIC" className="text-gray-900 bg-white">موقع</option>
                                   <option value="SYSTEM" className="text-gray-900 bg-white">نظام فقط</option>
                                   <option value="INACTIVE" className="text-gray-900 bg-white">غير مفعل</option>
                                </select>
                             </td>
                             <td className="px-6 py-4">
                                <Link 
                                   href={`/admin/services/edit/${service.id}`}
                                   className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                >
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                   </svg>
                                   تعديل
                                </Link>
                             </td>
                          </tr>
                       ))
                   ) : (
                      <tr>
                         <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-lg font-medium">لا توجد خدمات مطابقة للبحث</p>
                            </div>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}
