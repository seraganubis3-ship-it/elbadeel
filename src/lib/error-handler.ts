import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface ApiError {
  message: string;
  code?: string | undefined;
  statusCode: number;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  code?: string | undefined;
  statusCode: number;
  details?: unknown;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log error for debugging
  logger.error('API Error', error);

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: 'هذا البيان موجود بالفعل',
            code: 'DUPLICATE_ENTRY',
            ...(process.env.NODE_ENV === 'development' && { field: prismaError.meta?.target?.join(', ') }),
          },
          { status: 409 }
        );

      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: 'البيانات المطلوبة غير موجودة',
            code: 'RECORD_NOT_FOUND',
          },
          { status: 404 }
        );

      case 'P2003':
        return NextResponse.json(
          {
            success: false,
            error: 'علاقة غير صحيحة في البيانات',
            code: 'FOREIGN_KEY_CONSTRAINT',
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'حدث خطأ في قاعدة البيانات',
            code: 'DATABASE_ERROR',
          },
          { status: 500 }
        );
    }
  }

  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' ? { stack: error instanceof Error ? error.stack : undefined } : {}),
    },
    { status: 500 }
  );
}

export function asyncHandler(
  fn: (...args: unknown[]) => Promise<NextResponse>
): (...args: unknown[]) => Promise<NextResponse> {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<{ success: true; data: T }> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): NextResponse<{ success: false; error: string; code?: string }> {
  const response: { success: false; error: string; code?: string; details?: unknown } = {
    success: false,
    error: message,
  };
  
  if (code !== undefined) {
    response.code = code;
  }
  
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status: statusCode });
}
