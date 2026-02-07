import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      ...updateData
    } = data;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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
