import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import type { Session } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true, phone: true },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true, phone: true },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
}

export async function requireAdminOrStaff() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true, phone: true },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    throw new Error('Forbidden');
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
}

/**
 * استخراج تاريخ العمل من جلسة الأدمن أو Cookies
 * @param session جلسة المستخدم
 * @returns كائن Date صالح
 */
export function getWorkDate(session: Session | null): Date {
  // 1. محاولة قراءة التاريخ من الجلسة (للأدمن والموظفين فقط)
  if (
    session?.user &&
    (session.user.role === 'ADMIN' || session.user.role === 'STAFF') &&
    (session.user as any).workDate
  ) {
    const sessionDate = parseDate((session.user as any).workDate);
    if (sessionDate) return sessionDate;
  }

  // 2. محاولة القراءة من الكوكيز (Server-Side)
  try {
    const cookieStore = cookies();
    const workDateCookie = cookieStore.get('adminWorkDate');
    if (workDateCookie?.value) {
      const cookieVal = String(workDateCookie.value);
      const cookieDate = parseDate(cookieVal);
      if (cookieDate) return cookieDate;
    }
  } catch (error) {
    // cookies() might throw if called outside request context
  }

  // 3. العودة للتاريخ الحالي كافتراضي
  return new Date();
}

/**
 * دالة مساعدة لتحليل التاريخ من string
 */
function parseDate(dateStr: string): Date | null {
  try {
    // DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) return date;
        }
      }
    }

    // ISO or other formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    return null;
  } catch {
    return null;
  }
}
