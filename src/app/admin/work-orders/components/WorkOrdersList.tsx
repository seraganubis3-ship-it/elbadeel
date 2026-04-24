'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Calendar, Eye, FileText, Printer, Search, X } from 'lucide-react';
import { getStatusText } from '@/app/admin/orders/types';

export type WorkOrderListItem = {
  number: string;
  total: number;
  statuses: Record<string, number>;
  latestAt: string | null;
  customerNames: string[];
};

export type DateWorkOrderListItem = {
  dateKey: string;
  date: string;
  total: number;
  statuses: Record<string, number>;
  customerNames: string[];
};

interface WorkOrdersListProps {
  workOrders: WorkOrderListItem[];
  dateOrders: DateWorkOrderListItem[];
}

const normalizeArabicDigits = (value: string) =>
  value.replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const normalizeSearch = (value: string) =>
  normalizeArabicDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const formatDateParts = (dateValue: string | null) => {
  if (!dateValue) return [];

  const date = new Date(dateValue);
  if (!isValidDate(date)) return [];

  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return [
    `${yyyy}-${mm}-${dd}`,
    `${dd}/${mm}/${yyyy}`,
    `${mm}/${yyyy}`,
    `${dd}-${mm}-${yyyy}`,
    date.toLocaleDateString('ar-EG'),
    date.toLocaleDateString('en-GB'),
  ];
};

const formatVisibleDate = (dateValue: string | null) => {
  if (!dateValue) return 'بدون تاريخ';

  const date = new Date(dateValue);
  if (!isValidDate(date)) return 'بدون تاريخ';

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes('paid') || normalized.includes('confirmed') || normalized === 'done') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (normalized.includes('cancel') || normalized.includes('return')) {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }

  if (normalized.includes('pending') || normalized.includes('waiting')) {
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }

  return 'bg-blue-50 text-blue-700 border-blue-100';
};

const renderStatusSummary = (statuses: Record<string, number>) => {
  const parts = Object.entries(statuses)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));

  if (parts.length === 0) {
    return <span className='text-sm font-bold text-slate-400'>لا توجد حالة</span>;
  }

  return (
    <div className='flex flex-wrap gap-1.5'>
      {parts.map(({ status, count }) => (
        <span
          key={status}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${statusBadgeClass(
            status
          )}`}
        >
          <span>{getStatusText(status)}</span>
          <span className='rounded-full bg-white/80 px-1.5 text-slate-800'>{count}</span>
        </span>
      ))}
    </div>
  );
};

const matchesSearch = (values: string[], rawSearch: string) => {
  const search = normalizeSearch(rawSearch);
  if (!search) return true;

  return values.some(value => normalizeSearch(value).includes(search));
};

export function WorkOrdersList({ workOrders, dateOrders }: WorkOrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(order => {
      const dateValues = formatDateParts(order.latestAt);
      const statusValues = Object.keys(order.statuses).flatMap(status => [
        status,
        getStatusText(status),
      ]);

      const textMatches = matchesSearch(
        [order.number, ...order.customerNames, ...statusValues, ...dateValues],
        searchTerm
      );
      const dateMatches = !dateFilter || dateValues.includes(dateFilter);

      return textMatches && dateMatches;
    });
  }, [workOrders, searchTerm, dateFilter]);

  const filteredDateOrders = useMemo(() => {
    return dateOrders.filter(group => {
      const dateValues = formatDateParts(group.date);
      const statusValues = Object.keys(group.statuses).flatMap(status => [
        status,
        getStatusText(status),
      ]);

      const textMatches = matchesSearch(
        [group.dateKey, ...group.customerNames, ...statusValues, ...dateValues],
        searchTerm
      );
      const dateMatches = !dateFilter || dateValues.includes(dateFilter);

      return textMatches && dateMatches;
    });
  }, [dateOrders, searchTerm, dateFilter]);

  const hasAnyRecords = workOrders.length > 0 || dateOrders.length > 0;
  const hasSearch = Boolean(searchTerm.trim() || dateFilter);
  const hasAnyMatches = filteredWorkOrders.length > 0 || filteredDateOrders.length > 0;

  return (
    <section className='rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/80'>
      <div className='border-b border-slate-100 bg-gradient-to-l from-emerald-50/80 via-white to-blue-50/70 p-5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm'>
                <FileText className='h-5 w-5' />
              </span>
              <div>
                <h2 className='text-xl font-black text-slate-900'>أوامر شغل (Work Orders)</h2>
                <p className='mt-1 text-sm font-bold text-slate-500'>مرتبة من الأحدث إلى الأقدم</p>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl'>
            <div className='relative flex-1'>
              <Search className='absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder='ابحث برقم أمر الشغل، العميل، الحالة، أو التاريخ...'
                className='h-12 w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
              />
              {searchTerm && (
                <button
                  type='button'
                  onClick={() => setSearchTerm('')}
                  className='absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
                  aria-label='مسح البحث'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='relative sm:w-48'>
              <Calendar className='absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
              <input
                type='date'
                value={dateFilter}
                onChange={event => setDateFilter(event.target.value)}
                className='h-12 w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-black text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
              />
            </div>
          </div>
        </div>
      </div>

      {!hasAnyRecords ? (
        <div className='px-6 py-16 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400'>
            <FileText className='h-6 w-6' />
          </div>
          <p className='text-base font-black text-slate-500'>لا توجد أوامر شغل حالياً</p>
        </div>
      ) : !hasAnyMatches ? (
        <div className='px-6 py-16 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500'>
            <Search className='h-6 w-6' />
          </div>
          <p className='text-base font-black text-slate-600'>لا توجد أوامر شغل مطابقة للبحث</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 p-4 xl:grid-cols-2 xl:p-5'>
          <WorkOrderTable
            title='أوامر شغل مسجلة'
            count={filteredWorkOrders.length}
            items={filteredWorkOrders}
          />
          <DateOrderTable
            title='مستخرجات رسمية يومية'
            count={filteredDateOrders.length}
            items={filteredDateOrders}
          />
        </div>
      )}
    </section>
  );
}

function WorkOrderTable({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: WorkOrderListItem[];
}) {
  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3'>
        <h3 className='text-sm font-black text-blue-800'>{title}</h3>
        <span className='rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700'>
          {count}
        </span>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[680px] text-right'>
          <thead className='bg-white text-xs font-black text-slate-500'>
            <tr>
              <th className='px-5 py-3'>رقم الأمر</th>
              <th className='px-5 py-3'>آخر تاريخ</th>
              <th className='px-5 py-3'>الحالات</th>
              <th className='px-5 py-3'>الإجراء</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {items.map(order => (
              <tr key={order.number} className='transition-colors hover:bg-blue-50/40'>
                <td className='px-5 py-4'>
                  <Link
                    href={`/admin/work-orders/${encodeURIComponent(order.number)}`}
                    className='font-mono text-lg font-black text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline'
                    dir='ltr'
                  >
                    {order.number}
                  </Link>
                  <div className='mt-1 text-xs font-bold text-slate-400'>{order.total} طلب</div>
                </td>
                <td className='px-5 py-4 text-sm font-black text-slate-700'>
                  {formatVisibleDate(order.latestAt)}
                </td>
                <td className='px-5 py-4'>{renderStatusSummary(order.statuses)}</td>
                <td className='px-5 py-4'>
                  <ActionLinks hrefKey={order.number} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DateOrderTable({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: DateWorkOrderListItem[];
}) {
  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3'>
        <h3 className='text-sm font-black text-emerald-800'>{title}</h3>
        <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700'>
          {count}
        </span>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[680px] text-right'>
          <thead className='bg-white text-xs font-black text-slate-500'>
            <tr>
              <th className='px-5 py-3'>تاريخ العمل</th>
              <th className='px-5 py-3'>العدد الكلي</th>
              <th className='px-5 py-3'>ملخص الحالة</th>
              <th className='px-5 py-3'>إجراءات</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {items.map(group => (
              <tr key={group.dateKey} className='transition-colors hover:bg-emerald-50/50'>
                <td className='px-5 py-4 font-mono text-lg font-black text-emerald-700' dir='ltr'>
                  {new Date(group.date).toLocaleDateString('en-GB')}
                </td>
                <td className='px-5 py-4'>
                  <span className='inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700'>
                    {group.total} شهادة
                  </span>
                </td>
                <td className='px-5 py-4'>{renderStatusSummary(group.statuses)}</td>
                <td className='px-5 py-4'>
                  <ActionLinks hrefKey={`date_${group.dateKey}`} hidePrint />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionLinks({ hrefKey, hidePrint = false }: { hrefKey: string; hidePrint?: boolean }) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row'>
      <Link
        href={`/admin/work-orders/${encodeURIComponent(hrefKey)}`}
        className='inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm transition-all hover:bg-blue-50'
      >
        <Eye className='h-4 w-4' />
        عرض التفاصيل
      </Link>
      {!hidePrint && (
        <Link
          href={`/admin/work-orders/${encodeURIComponent(hrefKey)}/print`}
          target='_blank'
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:bg-emerald-100'
        >
          <Printer className='h-4 w-4' />
          طباعة
        </Link>
      )}
    </div>
  );
}
