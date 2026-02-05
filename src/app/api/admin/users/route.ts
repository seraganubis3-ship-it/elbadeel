import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { can } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const role = session?.user?.role as any;
    if (!session?.user || !can(role, 'users:read')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get('q') || '';
    const q = rawQ.trim();
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10', 10), 1), 50);
    const roleFilter = (searchParams.get('role') || '').toUpperCase();
    const filter = searchParams.get('filter'); // معامل الفلتر الجديد
    const creatorId = searchParams.get('creatorId');

    const where: any = {};

    // تطبيق الفلتر النشط أولاً
    if (filter) {
      if (filter === 'createdBy:admin') {
        where.role = 'USER';
        where.createdByAdminId = { not: null } as any;
      } else if (filter === 'createdBy:null') {
        where.role = 'USER';
        where.createdByAdminId = null;
      }
    }

    if (q) {
      const phoneDigits = q.replace(/[^0-9]/g, '');
      // Special filter: createdBy:admin → office clients
      if (q === 'createdBy:admin') {
        where.role = 'USER'; // Force USER role for office clients
        where.createdByAdminId = { not: null } as any;
      } else if (q === 'createdBy:null') {
        // Special filter: createdBy:null → online clients
        where.role = 'USER'; // Force USER role for online clients
        where.createdByAdminId = null;
      } else {
        const orClauses: any[] = [{ name: { contains: q } }, { email: { contains: q } }];
        if (phoneDigits.length > 0) {
          orClauses.push({ phone: { contains: phoneDigits } });
        }
        where.OR = orClauses;
      }
    }

    if (roleFilter === 'MANAGEMENT') {
      where.role = { in: ['ADMIN', 'STAFF', 'VIEWER'] };
    } else if (['ADMIN', 'STAFF', 'VIEWER', 'USER'].includes(roleFilter)) {
      where.role = roleFilter as any;
    }

    if (creatorId) {
      where.createdByAdminId = creatorId;
    }

    // Debug (server logs only)

    const [total, rows] = await Promise.all([
      prisma.user.count({ where } as any),
      prisma.user.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          phone: true,
          createdByAdminId: true,
          createdByAdmin: { select: { id: true, name: true, email: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      pageSize,
      rows,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const userRole = session?.user?.role as any;
    if (!session?.user || !can(userRole, 'users:write')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const newRole = formData.get('role') as string;
    const isActive = formData.get('isActive') === 'true';

    // التحقق من صحة البيانات
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // التحقق من أن البريد الإلكتروني فريد
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // تحديث المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone: phone || null,
        role: newRole as any,
        // isActive غير موجود في الـ schema، سنستخدم role بدلاً منه
        // يمكن إضافة حقل isActive لاحقاً في الـ schema
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (e) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
