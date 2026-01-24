// Advanced pagination utilities for better performance

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

// Cursor-based pagination (recommended for large datasets)
export function createCursorPagination<T>(
  data: T[],
  limit: number,
  cursor?: string,
  _orderBy: string = 'id'
): PaginationResult<T> {
  const startIndex = cursor ? Number(cursor) : 0; // ✅ بدل parseInt
  const endIndex = startIndex + limit;

  const paginatedData = data.slice(startIndex, endIndex);
  const hasNext = endIndex < data.length;
  const hasPrev = startIndex > 0;

  return {
    data: paginatedData,
    pagination: {
      page: Math.floor(startIndex / limit) + 1,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext,
      hasPrev,
      ...(hasNext && { nextCursor: endIndex.toString() }),
      ...(hasPrev && { prevCursor: Math.max(0, startIndex - limit).toString() }),
    },
  };
}

// Optimized Prisma query builder
export function buildOptimizedQuery(options: PaginationOptions) {
  const { page = 1, limit = 10, cursor, orderBy = 'id', orderDirection = 'desc' } = options;

  // Use cursor-based pagination for better performance
  if (cursor) {
    return {
      take: limit + 1, // Take one extra to check if there's a next page
      cursor: cursor ? { id: cursor } : undefined, // ✅ تأكد انه مش undefined
      skip: 1, // Skip the cursor itself
      orderBy: { [orderBy]: orderDirection },
    };
  }

  // Fallback to offset pagination for small datasets
  return {
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { [orderBy]: orderDirection },
  };
}

// Batch query optimization
export async function createBatchQuery<T>(
  queries: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(query => query()));
    results.push(...batchResults);
  }
  return results;
}

// Query optimization for common patterns
export const optimizedQueries = {
  // Get services with categories and variants in one query
  getServicesWithDetails: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          name: true,
          priceCents: true, // ✅ صححنا الاسم
          active: true, // ✅ بدل isActive
        },
        where: {
          active: true, // ✅ صححنا الاسم
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  },

  // Get orders with user and service details
  getOrdersWithDetails: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },

  // Get users with order count
  getUsersWithStats: {
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
  },
};

// Performance monitoring
export async function measureQueryPerformance<T>(
  _queryName: string,
  query: () => Promise<T>
): Promise<T> {
  // Performance monitoring disabled in production
  const result = await query();
  return result;
}
