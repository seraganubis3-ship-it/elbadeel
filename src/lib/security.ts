// Security utilities for the platform
import { NextResponse } from 'next/server';

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
  );

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (if using HTTPS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// File upload validation
export function validateFileUpload(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSize: number = 5 * 1024 * 1024 // 5MB
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مسموح. الأنواع المسموحة: ' + allowedTypes.join(', '),
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file name
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];

  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      valid: false,
      error: 'نوع الملف غير آمن',
    };
  }

  return { valid: true };
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على رقم واحد على الأقل');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  return {
    valid: score >= 3,
    score,
    feedback,
  };
}

// Session management
export function createSecureSession(_userId: string): {
  sessionId: string;
  expiresAt: Date;
} {
  const sessionId = generateCSRFToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { sessionId, expiresAt };
}

// IP validation
export function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Log security events
// export function logSecurityEvent(
//   event: string,
//   details: Record<string, any>,
//   severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
// ): void {
//   const logEntry = {
//     timestamp: new Date().toISOString(),
//     event,
//     details,
//     severity
//   };

//   // In production, send to security monitoring service
//   // sendToSecurityService(logEntry);
// }
