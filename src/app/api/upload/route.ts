import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 });
    }

    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `الملف ${file.name} كبير جداً. الحد الأقصى 5 ميجابايت`,
          },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `نوع الملف ${file.name} غير مسموح به`,
          },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'attachments');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Process each file
    const uploadedFiles = [];

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `attachment_${timestamp}_${randomId}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        originalName: file.name,
        filename: fileName,
        filePath: `/uploads/attachments/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
      });
    }

    // Return file paths
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء رفع الملفات',
      },
      { status: 500 }
    );
  }
}
