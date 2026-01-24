// Advanced query caching system for better performance
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache configuration
const CACHE_TAGS = {
  SERVICES: 'services',
  ORDERS: 'orders',
  USERS: 'users',
  CATEGORIES: 'categories',
  DASHBOARD: 'dashboard',
} as const;

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  SERVICES: 3600, // 1 hour
  ORDERS: 600, // 10 minutes
  USERS: 1800, // 30 minutes
  CATEGORIES: 7200, // 2 hours
  DASHBOARD: 300, // 5 minutes
} as const;

// Cached service queries
export const getCachedServices = unstable_cache(
  async (categoryId?: string) => {
    return await prisma.service.findMany({
      where: {
        active: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { active: true },
          select: { id: true, name: true, priceCents: true, etaDays: true },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['services'],
  { tags: [CACHE_TAGS.SERVICES], revalidate: CACHE_DURATIONS.SERVICES }
);

// Cached categories
export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['categories'],
  { tags: [CACHE_TAGS.CATEGORIES], revalidate: CACHE_DURATIONS.CATEGORIES }
);

// Cached user orders
export const getCachedUserOrders = unstable_cache(
  async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          service: { select: { name: true, slug: true } },
          variant: { select: { name: true, priceCents: true, etaDays: true } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  ['user-orders'],
  { tags: [CACHE_TAGS.ORDERS], revalidate: CACHE_DURATIONS.ORDERS }
);

// Cached dashboard stats
export const getCachedDashboardStats = unstable_cache(
  async () => {
    const [totalUsers, totalOrders, totalServices, totalRevenue, recentOrders, topServices] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.service.count({ where: { active: true } }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            service: { select: { name: true } },
          },
        }),
        prisma.service.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { orders: true } } },
        }),
      ]);

    return {
      totalUsers,
      totalOrders,
      totalServices,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentOrders,
      topServices,
    };
  },
  ['dashboard-stats'],
  { tags: [CACHE_TAGS.DASHBOARD], revalidate: CACHE_DURATIONS.DASHBOARD }
);

// Cache invalidation utilities
export async function invalidateCache(tags: string[]) {
  // Placeholder: implement with revalidateTag or Redis

  return true;
}

// Cache warming utilities
export async function warmCache() {
  try {
    await Promise.all([getCachedServices(), getCachedCategories(), getCachedDashboardStats()]);
  } catch (error) {
    //
  }
}

// Cache statistics
export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
}

class CacheStatsTracker {
  private hits = 0;
  private misses = 0;
  private cacheSize = 0;

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.misses / total) * 100 : 0,
      totalRequests: total,
      cacheSize: this.cacheSize,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.cacheSize = 0;
  }
}

export const cacheStats = new CacheStatsTracker();

// Cache middleware for API routes
export function withCache<T>(
  cacheKey: string,
  cacheTags: string[],
  duration: number,
  query: () => Promise<T>
): Promise<T> {
  return unstable_cache(
    async () => {
      cacheStats.recordMiss();
      return await query();
    },
    [cacheKey],
    { tags: cacheTags, revalidate: duration }
  )();
}

// Export cache configuration
export { CACHE_TAGS, CACHE_DURATIONS };
