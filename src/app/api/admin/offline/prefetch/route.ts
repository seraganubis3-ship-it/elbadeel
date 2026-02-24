import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all active services with their variants and fields
    const services = await prisma.service.findMany({
      where: { active: true },
      include: {
        variants: { where: { active: true } },
        fields: {
          where: { active: true },
          include: { options: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Fetch all active fines
    const fines = await prisma.fine.findMany({
      where: { isActive: true },
    });

    // Fetch all customers (Users who are not admins)
    // We fetch id, name, and phone as these are the most critical for offline search/selection
    const customers = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        idNumber: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        services,
        fines,
        customers,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Prefetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
