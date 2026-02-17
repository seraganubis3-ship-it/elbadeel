import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePresignedUrl } from '@/lib/presignedUrl';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await requireAuth();

    const orderId = params.id;

    // Get order details with all related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure user can only see their own orders
      },
      include: {
        service: {
          select: {
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            name: true,
            priceCents: true,
            etaDays: true,
          },
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            fileType: true,
            uploadedAt: true,
          },
          orderBy: {
            uploadedAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const enhancedDocuments = await Promise.all(
      order.documents.map(async doc => {
        // Generate Signed URL
        const signedUrl = await generatePresignedUrl(doc.filePath);

        // Extract documentType from filePath (which contains the generated unique name)
        // Format: .../orders/id/type_timestamp.ext
        const generatedFileName = doc.filePath.split('/').pop() || '';
        const lastUnderscoreIndex = generatedFileName.lastIndexOf('_');

        const documentType =
          lastUnderscoreIndex !== -1
            ? generatedFileName.substring(0, lastUnderscoreIndex)
            : 'unknown';

        return {
          ...doc,
          filePath: signedUrl, // Replace Key with Signed URL for frontend
          documentType,
        };
      })
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        service: order.service,
        variant: order.variant,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        address: order.address,
        notes: order.notes,
        selectedFines: order.selectedFines,
        finesDetails: order.finesDetails,
        documents: enhancedDocuments,
      },
    });
  } catch (error) {
    //
    // return NextResponse.json({
    // error: "حدث خطأ أثناء جلب تفاصيل الطلب"
    // }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await requireAuth();

    const orderId = params.id;
    const body = await request.json();

    // Only allow updating certain fields
    const allowedUpdates = ['status', 'notes'];
    const updates: any = {};

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'لا توجد تحديثات صالحة' }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure user can only update their own orders
      },
      data: updates,
      include: {
        service: {
          select: {
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            name: true,
            priceCents: true,
            etaDays: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'تم تحديث الطلب بنجاح',
    });
  } catch (error) {
    //
    // return NextResponse.json({
    // error: "حدث خطأ أثناء تحديث الطلب"
    // }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await requireAuth();

    const orderId = params.id;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Only allow cancellation of pending/waiting_confirmation orders
    const allowedStatuses = ['waiting_confirmation', 'PENDING', 'pending'];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: 'لا يمكن حذف الطلب في هذه الحالة',
        },
        { status: 400 }
      );
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
  } catch (error) {
    //
    // return NextResponse.json({
    // error: "حدث خطأ أثناء إلغاء الطلب"
    // }, { status: 500 });
  }
}
