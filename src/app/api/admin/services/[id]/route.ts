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
    console.error('GET Service Error:', error);
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

    // Parse JSON body
    const body = await request.json();
    const { name, description, categoryId, active, variants, documents, fields } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'اسم الخدمة والفئة مطلوبان' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Update service basic info
    await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || '',
        active: active !== false,
        categoryId,
      },
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
    console.error('PUT Service Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الخدمة' },
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
    console.error('DELETE Service Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الخدمة' }, { status: 500 });
  }
}
