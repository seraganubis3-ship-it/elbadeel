import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول هذه الصفحة' }, { status: 403 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const { fileName, filePath, fileSize, fileType } = body;

    if (!fileName || !filePath) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        orderId,
        fileName,
        filePath,
        fileSize,
        fileType,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
        console.error('Document Upload Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ المستند' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول هذه الصفحة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'رقم المستند مطلوب' }, { status: 400 });
    }

    // Try deleting from both possible models, ignoring "not found" errors
    try {
      await prisma.document.delete({
        where: { id: docId },
      });
    } catch (e: any) {
      if (e.code !== 'P2025') {
        // If not Document, try OrderDocument
        try {
          await prisma.orderDocument.delete({
            where: { id: docId },
          });
        } catch (e2: any) {
          if (e2.code !== 'P2025') throw e2;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
        console.error('Document Delete Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المستند' }, { status: 500 });
  }
}
