import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import type { Session } from 'next-auth';
import { cookies } from 'next/headers';
import { hasPermission } from './permissions';
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
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      adminRole: { select: { permissions: true } },
    },
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
      permissions: user.adminRole?.permissions || [],
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
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      adminRole: { select: { permissions: true } },
    },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  const permissions = user.adminRole?.permissions || [];
  const userWithPerms = { ...user, permissions };

  if (
    user.role !== 'ADMIN' &&
    !hasPermission(userWithPerms as any, 'CREATE_ORDER') &&
    !hasPermission(userWithPerms as any, 'MANAGE_ORDERS')
  ) {
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
      permissions: user.adminRole?.permissions || [],
    },
  };
}

export async function requireAdminOrStaff(options: { skipDB?: boolean } = {}) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Fast path: Use session data if skipDB is true
  if (options.skipDB) {
    const userRole = session.user.role;
    const permissions = (session.user as any).permissions || [];
    
    if (
      userRole !== 'ADMIN' &&
      userRole !== 'STAFF' &&
      !permissions.includes('CREATE_ORDER') &&
      !permissions.includes('MANAGE_ORDERS')
    ) {
      throw new Error('Forbidden');
    }

    return session;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      adminRole: { select: { permissions: true } },
    },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  const permissions = user.adminRole?.permissions || [];
  const userWithPerms = { ...user, permissions };

  if (
    user.role !== 'ADMIN' &&
    user.role !== 'STAFF' &&
    !hasPermission(userWithPerms as any, 'CREATE_ORDER') &&
    !hasPermission(userWithPerms as any, 'MANAGE_ORDERS')
  ) {
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
      permissions: user.adminRole?.permissions || [],
    },
  };
}

export async function requirePermission(permission: string) {
  const session = await requireAdminOrStaff();
  const user = session.user;

  if (!hasPermission(user, permission)) {
    throw new Error('Forbidden: Missing required permission - ' + permission);
  }

  return session;
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
    (hasPermission(session.user as any, 'CREATE_ORDER') ||
      hasPermission(session.user as any, 'MANAGE_ORDERS')) &&
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
