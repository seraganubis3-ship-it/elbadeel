import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePresignedUrl } from '@/lib/presignedUrl';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    // Check if user is authorized
    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;

    // Get order with full details
    const order = await prisma.order.findUnique({
      where: { id },
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
        createdByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        orderDocuments: true,
        documents: true,
        formSerials: {
          include: {
            formType: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const enhancedDocuments = await Promise.all(
      order.documents.map(async doc => {
        const signedUrl = await generatePresignedUrl(doc.filePath);
        return { ...doc, filePath: signedUrl };
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
        deliveryType: order.deliveryType,
        deliveryFee: order.deliveryFee,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        additionalPhone: order.additionalPhone,
        customerEmail: order.customerEmail,
        address: order.address,
        governorate: order.governorate,
        city: order.city,
        district: order.district,
        street: order.street,
        buildingNumber: order.buildingNumber,
        apartmentNumber: order.apartmentNumber,
        landmark: order.landmark,
        notes: order.notes,
        adminNotes: order.adminNotes,
        birthDate: order.birthDate,
        fatherName: order.fatherName,
        idNumber: order.idNumber,
        motherName: order.motherName,
        nationality: order.nationality,
        wifeName: order.wifeName,
        photographyLocation: order.photographyLocation,
        photographyDate: order.photographyDate,
        title: (order as any).title,
        quantity: order.quantity,
        serviceDetails: order.serviceDetails,
        otherFees: order.otherFees,
        discount: order.discount,
        gender: order.gender,
        policeStation: order.policeStation,
        pickupLocation: order.pickupLocation,
        marriageDate: (order as any).marriageDate,
        divorceDate: (order as any).divorceDate,
        wifeMotherName: (order as any).wifeMotherName,
        originalDocuments: order.originalDocuments,
        hasAttachments: order.hasAttachments,
        attachedDocuments: (order as any).attachedDocuments
          ? (() => {
              try {
                return JSON.parse((order as any).attachedDocuments);
              } catch {
                return [];
              }
            })()
          : [],
        selectedFines: (order as any).selectedFines,
        finesDetails: (order as any).finesDetails,
        servicesDetails: (order as any).servicesDetails,
        user: order.user,
        createdByAdmin: order.createdByAdmin,
        payment: order.payment,
        orderDocuments: order.orderDocuments,
        documents: enhancedDocuments,
        formSerials: order.formSerials.map((fs: any) => ({
          id: fs.id,
          serialNumber: fs.serialNumber,
          formType: fs.formType,
          consumed: fs.consumed,
          consumedAt: fs.consumedAt,
        })),
        // New fields for receipt
        paidAmount: order.payment?.amount || 0,
        remainingAmount: order.totalCents - (order.payment?.amount || 0),
        deliveryDuration: order.variant?.etaDays ? `${order.variant.etaDays} يوم` : 'غير محدد',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب تفاصيل الطلب',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;

    // Delete order and related data
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء حذف الطلب',
      },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    // Remove relations from data to prevent prisma errors if they were passed
    const {
      service,
      variant,
      user,
      payment,
      orderDocuments,
      formSerials,
      createdByAdmin,
      profession, // Remove unknown field
      ...updateData
    } = data;

    // Helper to safely parse dates
    const safeParseDate = (dateStr: string | null | undefined): Date | undefined | null => {
      if (!dateStr || dateStr === '') return undefined;
      try {
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          const date = new Date(`${year}-${month}-${day}`);
          return isNaN(date.getTime()) ? undefined : date;
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? undefined : date;
      } catch {
        return undefined;
      }
    };

    // Handle date fields specifically
    const dateFields = ['birthDate', 'marriageDate', 'divorceDate', 'deathDate', 'photographyDate'];
    const processedUpdateData: any = { ...updateData };

    for (const field of dateFields) {
      if (updateData[field] !== undefined) {
        // If it's a string, try to parse it. If it's null/empty, set to null (or undefined to skip update if that's preferred, but usually we want to allow clearing)
        // Based on error "premature end", it likely wants a Date object or proper ISO.
        // If value is sent as string "2000-12-10", new Date("2000-12-10") works.
        if (typeof updateData[field] === 'string' && updateData[field].trim() !== '') {
          processedUpdateData[field] = safeParseDate(updateData[field]);
        } else if (updateData[field] === '' || updateData[field] === null) {
          processedUpdateData[field] = null;
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: processedUpdateData,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        formSerials: {
          include: {
            formType: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    // console.error('Order Update Error:', error);
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تحديث بيانات الطلب',
      },
      { status: 500 }
    );
  }
}
