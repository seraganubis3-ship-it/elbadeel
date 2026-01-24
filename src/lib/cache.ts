// Cache utility for performance optimization
import { unstable_cache } from 'next/cache';

// Cache configuration
const CACHE_TTL = {
  SERVICES: 60 * 60, // 1 hour
  CATEGORIES: 60 * 60 * 24, // 24 hours
  USER_PROFILE: 60 * 5, // 5 minutes
  ORDERS: 60 * 2, // 2 minutes
};

// Cached functions
export const getCachedServices = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return await prisma.service.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: {
          where: { active: true },
        },
      },
    });
  },
  ['services'],
  { revalidate: CACHE_TTL.SERVICES }
);

export const getCachedCategories = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return await prisma.category.findMany({
      where: { active: true },
      include: {
        services: {
          where: { active: true },
          include: {
            variants: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['categories'],
  { revalidate: CACHE_TTL.CATEGORIES }
);

export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('@/lib/prisma');
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        governorate: true,
        city: true,
        birthDate: true,
        fatherName: true,
        motherName: true,
        nationality: true,
        wifeName: true,
        idNumber: true,
      },
    });
  },
  ['user-profile'],
  { revalidate: CACHE_TTL.USER_PROFILE }
);

// Cache invalidation
export const invalidateCache = {
  services: () => {
    // Invalidate services cache
  },
  categories: () => {
    // Invalidate categories cache
  },
  userProfile: (_userId: string) => {
    // Invalidate user profile cache
  },
};
