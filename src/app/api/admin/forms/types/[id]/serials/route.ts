import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const provider = request.nextUrl.searchParams.get('provider') || 'AL_BADEL';

    const serials = await (prisma as any).formSerial.findMany({
      where: { formTypeId: id, provider },
      orderBy: [{ consumed: 'asc' }, { createdAt: 'desc' }],
      include: {
        addedByAdmin: { select: { id: true, name: true, email: true } },
        consumedByAdmin: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, customerName: true } },
      },
    });
    return NextResponse.json({ success: true, serials });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الأرقام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const body = await request.json();
    const serials: string[] = Array.isArray(body.serials)
      ? Array.from(
          new Set(
            body.serials.map((serial: unknown) => String(serial ?? '').trim()).filter(Boolean)
          )
        )
      : [];
    const provider: string = body.provider || 'AL_BADEL';

    if (serials.length === 0) {
      return NextResponse.json({ error: 'يجب إدخال رقم استمارة واحد على الأقل' }, { status: 400 });
    }

    const existingSerials = await (prisma as any).formSerial.findMany({
      where: { serialNumber: { in: serials } },
      select: {
        serialNumber: true,
        provider: true,
        formType: { select: { name: true } },
      },
    });

    if (existingSerials.length > 0) {
      const duplicates = existingSerials.map(
        (item: any) =>
          `${item.serialNumber} (${item.formType?.name || 'نوع غير محدد'} - ${
            item.provider === 'AL_WAFI' ? 'الوافي' : 'البديل'
          })`
      );

      return NextResponse.json(
        {
          success: false,
          error: `لا يمكن تسجيل رقم استمارة موجود مسبقاً في أي نوع. الأرقام الموجودة: ${duplicates.join(', ')}`,
          duplicates: existingSerials.map((item: any) => item.serialNumber),
        },
        { status: 409 }
      );
    }

    const data = serials.map(s => ({
      formTypeId: id,
      serialNumber: s,
      provider,
      addedByAdminId: session.user.id,
    }));
    const created = await (prisma as any).formSerial.createMany({ data, skipDuplicates: true });

    // Return the actually created rows (best-effort reload)
    const createdRows = await (prisma as any).formSerial.findMany({
      where: { formTypeId: id, serialNumber: { in: serials }, provider },
      orderBy: { createdAt: 'desc' },
      include: {
        addedByAdmin: { select: { id: true, name: true, email: true } },
        consumedByAdmin: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, customerName: true } },
      },
    });

    return NextResponse.json({ success: true, createdCount: created.count, created: createdRows });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الأرقام' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params; // formTypeId
    const body = await request.json();
    const { serialId } = body;

    if (!serialId) {
      return NextResponse.json({ error: 'معرف الرقم التسلسلي مطلوب' }, { status: 400 });
    }

    // Verify it belongs to this form type for safety
    const serial = await (prisma as any).formSerial.findFirst({
      where: { id: serialId, formTypeId: id },
    });

    if (!serial) {
      return NextResponse.json(
        { error: 'عفوا، الرقم غير موجود أو لا ينتمي لهذا النموذج' },
        { status: 404 }
      );
    }

    /* We allow deleting even if consumed, as per user request
    if (serial.consumed) {
      return NextResponse.json({ error: 'لا يمكن حذف رقم تم استهلاكه بالفعل' }, { status: 400 });
    }
    */

    await (prisma as any).formSerial.delete({
      where: { id: serialId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الرقم' }, { status: 500 });
  }
}
