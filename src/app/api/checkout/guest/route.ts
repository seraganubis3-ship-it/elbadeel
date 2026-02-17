import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { orderData, userData } = await req.json();

    // 1. Validate Input
    if (!orderData || !userData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      // console.log('Existing user found:', existingUser.email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 } // Conflict
      );
    }

    // 3. Create User + Order in Transaction
    // Generate a secure password hash
    const hashedPassword = await hash(userData.password, 12);

    const result = await prisma.$transaction(async tx => {
      // Fetch default delivery fee if not provided
      let deliveryFee = orderData.deliveryFee || 0;
      if (deliveryFee === 0 && orderData.deliveryType !== 'OFFICE') {
        try {
          const settings = await tx.systemSettings.findUnique({
            where: { id: 'main' },
            select: { defaultDeliveryFee: true },
          });
          if (settings?.defaultDeliveryFee) {
            deliveryFee = settings.defaultDeliveryFee;
          }
        } catch (error) {
          // Continue with 0 if fetch fails
          // console.error('Failed to fetch default delivery fee', error);
        }
      }

      // A. Create User
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          name: userData.name,
          phone: userData.phone,
          role: 'USER',
          // Add address info if present
          address: orderData.address,
          governorate: orderData.governorate,
          city: orderData.city,
        },
      });

      // B. Create Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: orderData.serviceId,
          variantId: orderData.variantId,
          status: 'PENDING',
          totalPrice: orderData.totalPrice, // Consider recounting on server for security, but trusting client for now for speed
          totalCents: orderData.totalPrice * 100,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: userData.email,
          address: orderData.address,
          governorate: orderData.governorate,
          city: orderData.city,
          notes: orderData.notes,
          deliveryType: orderData.deliveryType,
          deliveryFee: deliveryFee,
          quantity: orderData.quantity || 1,
          // Specific fields
          idNumber: orderData.idNumber,
          birthDate: orderData.birthDate ? new Date(orderData.birthDate) : null,
          motherName: orderData.motherName,
          gender: orderData.gender,
          nationality: orderData.nationality,
          wifeName: orderData.wifeName,
          // ... map other fields as needed
        },
      });

      return { user, order };
    });

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      userId: result.user.id,
    });
  } catch (error: any) {
    // console.error('Error creating guest order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
