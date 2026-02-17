'use server';

import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff } from '@/lib/auth';

export type SearchResult = {
  type: 'WORK_ORDER' | 'DATE'; // 'WORK_ORDER' for explicit numbers, 'DATE' for date-based
  key: string; // The workOrderNumber OR the date string (YYYY-MM-DD)
  label: string; // Display text (e.g., "Work Order #123" or "2023-10-27")
  matchingOrderCount: number; // How many orders in this WO match the search
  matchReason: string; // "Matched Customer: Ahmed..." or "Matched Order #..."
};

export async function searchWorkOrdersAction(term: string): Promise<SearchResult[]> {
  await requireAdminOrStaff();

  if (!term || term.trim().length < 2) return [];

  const searchTerm = term.trim();

  // 1. Search for Orders matching the term (Customer Name, Phone, ID)
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        {
          OR: [
            { customerName: { contains: searchTerm } },
            { customerPhone: { contains: searchTerm } },
            { id: { contains: searchTerm } },
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
      service: { select: { slug: true } },
    },
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
    }
  }

  return Array.from(resultsMap.values());
}
