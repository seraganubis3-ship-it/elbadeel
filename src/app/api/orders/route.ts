import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth();

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        service: {
          select: {
            name: true,
            slug: true,
          }
        },
        variant: {
          select: {
            name: true,
            priceCents: true,
            etaDays: true,
          }
        },
        payment: true
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      success: true, 
      orders: orders.map(order => ({
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
        customerEmail: order.customerEmail,
        address: order.address,
        notes: order.notes,
        payment: order.payment ? {
          method: order.payment.method,
          status: order.payment.status,
          senderPhone: order.payment.senderPhone,
        } : undefined,
      }))
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب الطلبات" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API Route Called ===');
    
    // Check authentication
    const session = await requireAuth();
    console.log('Session:', session);
    console.log('Session user:', session.user);
    
    console.log('User authenticated:', session.user.id, session.user.email);
    console.log('User ID type:', typeof session.user.id);
    console.log('User ID length:', session.user.id.length);
    
    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    console.log('User exists in DB:', !!userExists);
    console.log('User from DB:', userExists?.email);

    // Parse form data
    const formData = await request.formData();
    
    // Log all form data for debugging
    console.log('=== Form Data Debug ===');
    const formEntries = Array.from(formData.entries());
    console.log('Form data entries count:', formEntries.length);
    for (const [key, value] of formEntries) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: "${value}" (type: ${typeof value}, length: ${value?.length})`);
      }
    }
    
    // Extract basic order data
    const serviceId = formData.get("serviceId") as string;
    const variantId = formData.get("variantId") as string;
    const notes = formData.get("notes") as string;
    const deliveryType = formData.get("deliveryType") as string;
    const deliveryFee = parseInt(formData.get("deliveryFee") as string) || 0;
    
    // Extract personal information
    const wifeName = formData.get("wifeName") as string;
    const fatherName = formData.get("fatherName") as string;
    const motherName = formData.get("motherName") as string;
    const birthDate = formData.get("birthDate") as string;
    const nationality = formData.get("nationality") as string;
    const idNumber = formData.get("idNumber") as string;

    console.log('=== Extracted Data ===');
    console.log('Form data received:', { serviceId, variantId });
    console.log('Service ID type:', typeof serviceId, 'length:', serviceId?.length);
    console.log('Variant ID type:', typeof variantId, 'length:', variantId?.length);
    console.log('All form data keys:', Array.from(formData.keys()));
    
    // Validate that IDs are not empty
    if (!serviceId || serviceId.trim() === '') {
      console.log('❌ Service ID is empty or undefined');
      return NextResponse.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });
    }
    
    if (!variantId || variantId.trim() === '') {
      console.log('❌ Variant ID is empty or undefined');
      return NextResponse.json({ error: "معرف نوع الخدمة مطلوب" }, { status: 400 });
    }
    
    console.log('✅ IDs validation passed');

    // Validate required fields
    if (!serviceId || !variantId) {
      return NextResponse.json({ error: "معرف الخدمة ونوع الخدمة مطلوبان" }, { status: 400 });
    }

    // Test Prisma connection
    try {
      console.log('Testing Prisma connection...');
      const testQuery = await prisma.service.findFirst();
      console.log('Prisma test query result:', testQuery);
    } catch (prismaError) {
      console.error('Prisma connection error:', prismaError);
      return NextResponse.json({ 
        error: "مشكلة في الاتصال بقاعدة البيانات" 
      }, { status: 500 });
    }

    // Get service and variant to calculate total
    console.log('Looking for service with ID:', serviceId);
    console.log('Service ID to search:', `"${serviceId}"`);
    
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { variants: true }
    });

    console.log('Service found:', service);
    console.log('Service ID from DB:', service?.id);
    console.log('Service variants count:', service?.variants?.length);

    if (!service) {
      console.log('Service not found for ID:', serviceId);
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }

    console.log('Looking for variant with ID:', variantId);
    console.log('Variant ID to search:', `"${variantId}"`);
    console.log('Available variant IDs:', service.variants.map((v: any) => v.id));
    
    const variant = service.variants.find((v: any) => v.id === variantId);
    console.log('Variant found:', variant);
    console.log('Variant ID from DB:', variant?.id);
    
    if (!variant) {
      console.log('Variant not found for ID:', variantId);
      return NextResponse.json({ error: "نوع الخدمة غير صحيح" }, { status: 400 });
    }

    // Create order
    const orderData = {
      serviceId,
      variantId,
      notes,
      totalPrice: variant.priceCents + deliveryFee,
      totalCents: variant.priceCents + deliveryFee, // Add totalCents for compatibility
      customerName: session.user.name || "Unknown",
      customerPhone: (session.user as any).phone || "Unknown",
      customerEmail: session.user.email || "Unknown",
      userId: session.user.id,
      deliveryType,
      deliveryFee,
      // Add personal information
      wifeName: wifeName || null,
      fatherName: fatherName || null,
      motherName: motherName || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      nationality: nationality || null,
      idNumber: idNumber || null,
    };
    
    console.log('Creating order with data:', orderData);
    console.log('User ID type:', typeof session.user.id);
    console.log('User ID value:', session.user.id);
    
    // Double-check all foreign keys exist before creating order
    console.log('=== Final Validation ===');
    
    // Check if service exists
    const serviceCheck = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    console.log('Service check:', !!serviceCheck, serviceCheck?.id);
    
    // Check if variant exists
    const variantCheck = await prisma.serviceVariant.findUnique({
      where: { id: variantId }
    });
    console.log('Variant check:', !!variantCheck, variantCheck?.id);
    
    // Check if user exists
    const userCheck = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    console.log('User check:', !!userCheck, userCheck?.id);
    
    if (!serviceCheck || !variantCheck || !userCheck) {
      console.log('❌ Foreign key validation failed');
      return NextResponse.json({ 
        error: "بيانات غير صحيحة - يرجى المحاولة مرة أخرى" 
      }, { status: 400 });
    }
    
    console.log('✅ All foreign keys validated successfully');
    
    const order = await prisma.order.create({
      data: orderData,
    });
    
    console.log('Order created successfully:', order);

    // Update user profile with personal information if provided
    if (wifeName || fatherName || motherName || birthDate || nationality || idNumber) {
      try {
        const userUpdateData: any = {};
        if (wifeName) userUpdateData.wifeName = wifeName;
        if (fatherName) userUpdateData.fatherName = fatherName;
        if (motherName) userUpdateData.motherName = motherName;
        if (birthDate) userUpdateData.birthDate = new Date(birthDate);
        if (nationality) userUpdateData.nationality = nationality;
        if (idNumber) userUpdateData.idNumber = idNumber;

        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData
        });
        
        console.log('User profile updated with personal information');
      } catch (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError);
        // Don't fail the order creation if user update fails
      }
    }

    // Handle file uploads
    const uploadedFiles: any[] = [];
    
    // Get all form data entries to find files
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = join(process.cwd(), 'public', 'uploads', 'orders', order.id);
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = value.name.split('.').pop();
          const fileName = `${key}_${timestamp}.${fileExtension}`;
          const filePath = join(uploadsDir, fileName);

          // Convert file to buffer and save
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filePath, buffer);

          // Save file metadata to database
          const orderDocument = await prisma.orderDocument.create({
            data: {
              orderId: order.id,
              fileName: value.name,
              filePath: `/uploads/orders/${order.id}/${fileName}`,
              fileSize: value.size,
              fileType: value.type,
              documentType: key, // This will be the field name (e.g., "idDocument", "contract", etc.)
            },
          });

          uploadedFiles.push({
            originalName: value.name,
            savedPath: `/uploads/orders/${order.id}/${fileName}`,
            size: value.size,
            type: value.type,
          });

          console.log(`File uploaded successfully: ${value.name} -> ${fileName}`);
        } catch (fileError) {
          console.error(`Error uploading file ${value.name}:`, fileError);
          // Continue with other files even if one fails
        }
      }
    }

    console.log(`Total files uploaded: ${uploadedFiles.length}`);

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      filesUploaded: uploadedFiles.length,
      message: "تم إنشاء الطلب بنجاح",
      redirectUrl: `/order-success?orderId=${order.id}&filesUploaded=${uploadedFiles.length}`
    });

  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: "حدث خطأ أثناء إنشاء الطلب" 
    }, { status: 500 });
  }
}


