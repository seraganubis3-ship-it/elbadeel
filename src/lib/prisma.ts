import { PrismaClient } from '@prisma/client';

// Optimized Prisma client with connection pooling
const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors in production, queries only in development
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Reuse connection in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown is handled by Next.js/Vercel
// Removing manual listener to prevent MaxListenersExceededWarning in dev
