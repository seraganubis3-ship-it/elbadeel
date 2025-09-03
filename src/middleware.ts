import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // حماية صفحات لوحة التحكم
  if (pathname.startsWith('/admin')) {
    // تحقق من وجود token في cookies
    const token = request.cookies.get('next-auth.session-token') || 
                  request.cookies.get('__Secure-next-auth.session-token');
    
    // إذا لم يكن هناك token، أعد توجيهه لصفحة تسجيل الدخول
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // إذا كان هناك token، اتركه يمر (سيتم التحقق من الصلاحيات في الصفحة)
    // لأن getToken لا يعمل في middleware
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
