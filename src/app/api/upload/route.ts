import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { s3Client } from '@/lib/s3';
import { Upload } from '@aws-sdk/lib-storage';
import { generatePresignedUrl } from '@/lib/presignedUrl';

export const dynamic = 'force-dynamic';

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
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت` },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `نوع الملف ${file.name} غير مسموح به` }, { status: 400 });
      }

      // Upload to B2
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `attachments/${timestamp}_${randomId}.${fileExtension}`;
      const bucketName = process.env.B2_BUCKET_NAME!;

      try {
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            // ACL: 'public-read', // Depends on bucket settings, usually B2 buckets are private by default or public.
            // If private, we might need presigned URLs. Assuming Public for now based on "elbadeel" (likely public assets)
            // OR we store the Key and generate Presigned URLs on read.
            // Requirement says "linked to Backblaze B2".
            // I'll return the Public URL structure for B2: https://f005.backblazeb2.com/file/<bucket_name>/<key>
            // derived from Endpoint.
          },
        });

        await upload.done();

        // Construct Public URL (Assuming F-series or S3 endpoint)
        // B2 S3 Enpoint: s3.us-east-005.backblazeb2.com
        // Friendly URL: https://<bucket_name>.s3.<region>.backblazeb2.com/<key>
        // OR https://f005.backblazeb2.com/file/<bucket_name>/<key>

        // Let's use the S3 standard URL if possible, or build it.
        // Safest is to return the full URL if public, or just the Key.
        // I will return a standard URL format.

        // Generate Signed URL for immediate display
        const signedUrl = await generatePresignedUrl(fileName);

        uploadedFiles.push({
          originalName: file.name,
          filename: fileName, // The Key
          filePath: signedUrl, // Temporary Signed URL for immediate display
          key: fileName, // Explicit key for DB storage if needed
          fileSize: file.size,
          fileType: file.type,
        });
      } catch (uploadError) {
        // B2 Upload Error
        return NextResponse.json({ error: `فشل في رفع الملف ${file.name}` }, { status: 500 });
      }
    }

    // Return file paths
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    // Upload API Error
    return NextResponse.json({ error: 'حدث خطأ أثناء رفع الملفات' }, { status: 500 });
  }
}
