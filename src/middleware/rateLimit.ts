// Rate limiting middleware for Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting in middleware - it will be handled in API routes
  // This is because ioredis doesn't work in Edge runtime
  return NextResponse.next();
}
