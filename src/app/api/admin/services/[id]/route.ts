import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { priceCents: 'asc' },
        },
        documents: {
          orderBy: { orderIndex: 'asc' },
        },
        fields: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    // console.error('GET Service Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الخدمة' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Parse FormData
    const formData = await request.formData();
    
    // Extract basic fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const active = formData.get('active') === 'true';
    const isHidden = formData.get('isHidden') === 'true';
    const image = formData.get('image') as File | null;
    
    // Extract complex fields (JSON strings)
    let variants: any[] = [];
    let documents: any[] = [];
    let fields: any[] = [];
    
    try {
      const variantsStr = formData.get('variants') as string;
      if (variantsStr) variants = JSON.parse(variantsStr);
      
      const documentsStr = formData.get('documents') as string;
      if (documentsStr) documents = JSON.parse(documentsStr);
      
      const fieldsStr = formData.get('fields') as string;
      if (fieldsStr) fields = JSON.parse(fieldsStr);
    } catch (e) {
      // console.error('JSON Parse Error:', e);
      return NextResponse.json(
        { success: false, error: 'بيانات غير صالحة' },
        { status: 400 }
      );
    }

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'اسم الخدمة والفئة مطلوبان' },
        { status: 400 }
      );
    }

    // Handle Image Upload
    let imagePath: string | undefined = undefined;
    if (image && image.size > 0) {
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'services');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const fileName = `${timestamp}_${image.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const filePath = join(uploadsDir, fileName);

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        imagePath = `/uploads/services/${fileName}`;
    }

    // Prepare update data
    const updateData: any = {
        name,
        // slug, // Disable auto-slug update to keep links stable
        description: description || '',
        active,
        isHidden,
        categoryId,
    };
    
    // Optional: Allow manual slug update if provided
    const manualSlug = formData.get('slug') as string;
    if (manualSlug) {
        updateData.slug = manualSlug
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
    }
    
    if (imagePath) {
        updateData.icon = imagePath;
    }

    // Update service basic info
    await prisma.service.update({
      where: { id },
      data: updateData,
    });

    // Handle Variants
    if (variants && Array.isArray(variants)) {
      // Get existing variant IDs
      const existingVariants = await prisma.serviceVariant.findMany({
        where: { serviceId: id },
        select: { id: true },
      });

      const existingIds = existingVariants.map(v => v.id);
      const newIds = variants.filter(v => !v.id.startsWith('temp-')).map(v => v.id);

      // Delete variants not in the new list
      const toDelete = existingIds.filter(id => !newIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.serviceVariant.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // Create or update variants
      for (const v of variants) {
        if (v.id.startsWith('temp-')) {
          await prisma.serviceVariant.create({
            data: {
              name: v.name,
              priceCents: parseInt(v.priceCents) || 0,
              etaDays: parseInt(v.etaDays) || 0,
              active: v.active !== false,
              serviceId: id,
            },
          });
        } else {
          await prisma.serviceVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              priceCents: parseInt(v.priceCents) || 0,
              etaDays: parseInt(v.etaDays) || 0,
              active: v.active !== false,
            },
          });
        }
      }
    }

    // Handle Documents
    if (documents && Array.isArray(documents)) {
      const existingDocs = await prisma.serviceDocument.findMany({
        where: { serviceId: id },
        select: { id: true },
      });

      const existingIds = existingDocs.map(d => d.id);
      const newIds = documents.filter(d => !d.id.startsWith('temp-')).map(d => d.id);

      const toDelete = existingIds.filter(id => !newIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.serviceDocument.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        if (doc.id.startsWith('temp-')) {
          await prisma.serviceDocument.create({
            data: {
              serviceId: id,
              title: doc.title,
              description: doc.description || '',
              required: doc.required !== false,
              orderIndex: i,
              showIf: doc.showIf || null,
            },
          });
        } else {
          await prisma.serviceDocument.update({
            where: { id: doc.id },
            data: {
              title: doc.title,
              description: doc.description || '',
              required: doc.required !== false,
              orderIndex: i,
              showIf: doc.showIf || null,
            },
          });
        }
      }
    }

    // Handle Fields (Questions)
    if (fields && Array.isArray(fields)) {
      const existingFields = await prisma.serviceField.findMany({
        where: { serviceId: id },
        select: { id: true },
      });

      const existingIds = existingFields.map(f => f.id);
      const newIds = fields.filter(f => !f.id.startsWith('temp-')).map(f => f.id);

      const toDelete = existingIds.filter(id => !newIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.serviceField.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        let fieldId = field.id;

          if (field.id.startsWith('temp-')) {
            const newField = await prisma.serviceField.create({
              data: {
                serviceId: id,
                name: field.name || `field_${i}`,
                label: field.label,
                type: field.type || 'select',
                placeholder: field.placeholder || null,
                required: field.required !== false,
                orderIndex: i,
                showIf: field.showIf || null,
              },
            });
            fieldId = newField.id;
          } else {
            await prisma.serviceField.update({
              where: { id: field.id },
              data: {
                name: field.name,
                label: field.label,
                type: field.type,
                placeholder: field.placeholder || null,
                required: field.required !== false,
                orderIndex: i,
                showIf: field.showIf || null,
              },
            });
          }

        // Handle Options
        if (field.options && Array.isArray(field.options)) {
          const existingOptions = await prisma.serviceFieldOption.findMany({
            where: { fieldId },
            select: { id: true },
          });

          const existingOptIds = existingOptions.map(o => o.id);
          const newOptIds = field.options
            .filter((o: any) => !o.id.startsWith('temp-'))
            .map((o: any) => o.id);

          const toDeleteOpts = existingOptIds.filter(id => !newOptIds.includes(id));
          if (toDeleteOpts.length > 0) {
            await prisma.serviceFieldOption.deleteMany({
              where: { id: { in: toDeleteOpts } },
            });
          }

          for (let j = 0; j < field.options.length; j++) {
            const opt = field.options[j];
            const requiredDocsStr = opt.requiredDocs
              ? Array.isArray(opt.requiredDocs)
                ? JSON.stringify(opt.requiredDocs)
                : opt.requiredDocs
              : null;

            if (opt.id.startsWith('temp-')) {
              await prisma.serviceFieldOption.create({
                data: {
                  fieldId: fieldId,
                  value: opt.value || opt.label,
                  label: opt.label,
                  orderIndex: j,
                  requiredDocs: requiredDocsStr,
                },
              });
            } else {
              await prisma.serviceFieldOption.update({
                where: { id: opt.id },
                data: {
                  value: opt.value || opt.label,
                  label: opt.label,
                  orderIndex: j,
                  requiredDocs: requiredDocsStr,
                },
              });
            }
          }
        }
      }
    }

    // Return updated service
    const updatedService = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: { priceCents: 'asc' } },
        documents: { orderBy: { orderIndex: 'asc' } },
        fields: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error) {
    // console.error('PUT Service Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الخدمة' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { active, isHidden } = body;

    const updateData: any = {};
    if (typeof active === 'boolean') updateData.active = active;
    if (typeof isHidden === 'boolean') updateData.isHidden = isHidden;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
            { success: false, error: 'بيانات غير صالحة' },
            { status: 400 }
        );
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث حالة الخدمة' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;

    // Check if service has orders
    const orderCount = await prisma.order.count({
      where: { serviceId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error: 'لا يمكن حذف هذه الخدمة لأنها مرتبطة بطلبات موجودة',
        },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('DELETE Service Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الخدمة' }, { status: 500 });
  }
}
