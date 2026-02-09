import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimized Prisma client with connection pooling
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // Only log errors in production, queries only in development
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Reuse connection in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown is handled by Next.js/Vercel
// Removing manual listener to prevent MaxListenersExceededWarning in dev

