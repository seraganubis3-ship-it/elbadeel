import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.length < 1) {
      return NextResponse.json({ error: 'الاسم مطلوب للبحث' }, { status: 400 });
    }

    // Super fast search with optimized query
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { phone: { contains: name, mode: 'insensitive' } },
          { idNumber: { contains: name, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        additionalPhone: true,
        address: true,
        governorate: true,
        city: true,
        district: true,
        street: true,
        buildingNumber: true,
        apartmentNumber: true,
        landmark: true,
        birthDate: true,
        fatherName: true,
        idNumber: true,
        motherName: true,
        nationality: true,
        wifeName: true,
        createdAt: true,
      },
      // Limit results for better performance
      take: 5, // Reduced to 5 for faster response
      // Order by most recent for better UX
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return both single user (for backward compatibility) and multiple users
    return NextResponse.json({
      success: true,
      user: users.length > 0 ? users[0] : null,
      users: users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء البحث عن العميل',
      },
      { status: 500 }
    );
  }
}
