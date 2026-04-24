'use server';

import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff } from '@/lib/auth';
import { getStatusText, STATUS_CONFIG } from '@/app/admin/orders/types';

export type SearchResult = {
  type: 'WORK_ORDER' | 'DATE'; // 'WORK_ORDER' for explicit numbers, 'DATE' for date-based
  key: string; // The workOrderNumber OR the date string (YYYY-MM-DD)
  label: string; // Display text (e.g., "Work Order #123" or "2023-10-27")
  matchingOrderCount: number; // How many orders in this WO match the search
  matchReason: string; // "Matched Customer: Ahmed..." or "Matched Order #..."
};

const normalizeArabicDigits = (value: string) =>
  value.replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const normalizeSearch = (value: string) =>
  normalizeArabicDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

const parseSearchDateRange = (term: string) => {
  const normalized = normalizeArabicDigits(term.trim());
  const isoDate = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dayMonthYear = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const monthYear = normalized.match(/^(\d{1,2})[/-](\d{4})$/);

  if (isoDate) {
    const [, year, month, day] = isoDate;
    const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
    const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
    return Number.isNaN(start.getTime()) ? null : { gte: start, lte: end };
  }

  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear;
    const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
    const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
    return Number.isNaN(start.getTime()) ? null : { gte: start, lte: end };
  }

  if (monthYear) {
    const [, month, year] = monthYear;
    const start = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    return Number.isNaN(start.getTime()) ? null : { gte: start, lte: end };
  }

  return null;
};

export async function searchWorkOrdersAction(term: string): Promise<SearchResult[]> {
  await requireAdminOrStaff();

  if (!term || term.trim().length < 2) return [];

  const searchTerm = term.trim();
  const normalizedSearchTerm = normalizeSearch(searchTerm);
  const dateRange = parseSearchDateRange(searchTerm);
  const matchingStatuses = Object.keys(STATUS_CONFIG).filter(status =>
    normalizeSearch(`${status} ${getStatusText(status)}`).includes(normalizedSearchTerm)
  );

  // 1. Search for Orders matching the term (work order, customer, status, date)
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        {
          OR: [
            { customerName: { contains: searchTerm } },
            { customerPhone: { contains: searchTerm } },
            { id: { contains: searchTerm } },
            { workOrderNumber: { contains: searchTerm } },
            { status: { contains: searchTerm } },
            ...(matchingStatuses.length > 0 ? [{ status: { in: matchingStatuses } }] : []),
            ...(dateRange ? [{ createdAt: dateRange }] : []),
          ],
        },
        {
          OR: [
            { workOrderNumber: { not: null } },
            {
              service: {
                slug: {
                  in: ['birth-certificate'],
                },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      workOrderNumber: true,
      createdAt: true,
      customerName: true,
      status: true,
      service: { select: { slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to avoid massive queries
  });

  // 2. Group results by Work Order
  const resultsMap = new Map<string, SearchResult>();

  for (const order of orders) {
    let type: 'WORK_ORDER' | 'DATE';
    let key: string;
    let label: string;

    if (order.workOrderNumber) {
      type = 'WORK_ORDER';
      key = String(order.workOrderNumber);
      label = `أمر شغل رقم ${order.workOrderNumber}`;
    } else {
      // It's a date-based one
      type = 'DATE';
      key = order.createdAt.toISOString().split('T')[0] as string;
      label = `شهادات ميلاد كمبيوتر بتاريخ ${new Date(key).toLocaleDateString('ar-EG')}`;
    }

    if (!key) continue;

    const mapKey = `${type}_${key}`;

    if (!resultsMap.has(mapKey)) {
      resultsMap.set(mapKey, {
        type,
        key,
        label,
        matchingOrderCount: 0,
        matchReason: `مطابقة: ${order.customerName}`, // Default reason
      });
    }

    const entry = resultsMap.get(mapKey)!;
    entry.matchingOrderCount++;

    // Update reason to be more specific if possible
    if (order.id.includes(searchTerm)) {
      entry.matchReason = `مطابقة رقم الطلب: ...${order.id.slice(-6)}`;
    } else if (order.workOrderNumber?.includes(searchTerm)) {
      entry.matchReason = `مطابقة رقم أمر الشغل: ${order.workOrderNumber}`;
    } else if (normalizeSearch(getStatusText(order.status)).includes(normalizedSearchTerm)) {
      entry.matchReason = `مطابقة الحالة: ${getStatusText(order.status)}`;
    } else if (dateRange) {
      entry.matchReason = `مطابقة التاريخ: ${order.createdAt.toLocaleDateString('ar-EG')}`;
    }
  }

  return Array.from(resultsMap.values());
}
