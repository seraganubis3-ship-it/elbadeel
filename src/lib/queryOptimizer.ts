// Query optimization utilities to prevent N+1 queries and improve performance
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

// Optimized service queries
export const serviceQueries = {
  // Get services with all related data in one query
  async getServicesWithDetails(
    options: {
      page?: number;
      limit?: number;
      categoryId?: string;
      isActive?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 10, categoryId, isActive = true } = options;

    const where: Prisma.ServiceWhereInput = {
      active: isActive,
      ...(categoryId && { categoryId }),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              priceCents: true, // ✅ بدل price
              active: true, // ✅ بدل isActive
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single service with all details
  async getServiceWithDetails(serviceId: string) {
    return prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // variants: {
        //   where: { active: true },
        //   select: {
        //     id: true,
        //     name: true,
        //     priceCents: true,   // ✅
        //     description: true,
        //     active: true,       // ✅
        //   },
        // },
        // formTypes: {
        //   where: { active: true },
        //   select: {
        //     id: true,
        //     name: true,
        //     description: true,
        //     requiredFields: true,
        //     active: true,
        //   },
        // },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
  },
};

// Optimized order queries
export const orderQueries = {
  // Get orders with user and service details
  async getOrdersWithDetails(
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      status?: string;
      serviceId?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, userId, status, serviceId } = options;

    const where: Prisma.OrderWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(serviceId && { serviceId }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.order.count({ where }),
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

  // Get single order with all details
  async getOrderWithDetails(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true,
          },
        },
      },
    });
  },
};

// Optimized user queries
export const userQueries = {
  // Get users with order statistics
  async getUsersWithStats(
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search } = options;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

// Optimized category queries
export const categoryQueries = {
  // Get categories with service counts
  async getCategoriesWithCounts() {
    return prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            services: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },
};

// Dashboard statistics (optimized)
export const dashboardQueries = {
  async getDashboardStats() {
    const [totalUsers, totalOrders, totalServices, totalRevenue, recentOrders, topServices] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.service.count({ where: { active: true } }), // ✅ بدل isActive
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true },
            },
            service: {
              select: { name: true },
            },
          },
        }),
        prisma.service.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { orders: true },
            },
          },
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
};

// // Query performance monitoring
// export async function withPerformanceMonitoring<T>(
//   _queryName: string,
//   query: () => Promise<T>
// ): Promise<T> {
//   const startTime = Date.now();

//   const result = await query();
//   const endTime = Date.now();
//   const duration = endTime - startTime;

//   // if (duration > 1000) {
//   //
//   // }

//   return result;
// }

// Batch operations for better performance
export async function batchOperations<T>(
  operations: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }

  return results;
}
