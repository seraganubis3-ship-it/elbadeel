import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const fines = await prisma.fine.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, fines });
  } catch (error) {
    console.error('Error fetching fines:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب الغرامات والرسوم' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    // Seed mode for initial migration
    if (body.seed && Array.isArray(body.fines)) {
      const createdFines = [];
      for (const fine of body.fines) {
        // Upsert based on name + category or just create if empty DB
        const existing = await prisma.fine.findFirst({
          where: { id: fine.id },
        });
        if (!existing) {
          const newFine = await prisma.fine.create({
            data: {
              id: fine.id,
              name: fine.name,
              description: fine.description || '',
              amountCents: fine.amountCents,
              category: fine.category,
            },
          });
          createdFines.push(newFine);
        }
      }
      return NextResponse.json({ success: true, message: 'Seeded successfully', createdFines });
    }

    const { name, description, amountCents, category } = body;

    if (!name || amountCents === undefined || !category) {
      return NextResponse.json({ success: false, error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    const fine = await prisma.fine.create({
      data: {
        name,
        description,
        amountCents: Number(amountCents),
        category,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, fine });
  } catch (error) {
    console.error('Error creating fine:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إنشاء الرسم/الغرامة' },
      { status: 500 }
    );
  }
}
