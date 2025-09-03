import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth();
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب أن يكون أقل من 10 ميجابايت" }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مسموح به" }, { status: 400 });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `payment_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Return file path
    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: `/uploads/payments/${fileName}`,
      fileSize: file.size,
      fileType: file.type,
    });
    
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء رفع الملف" 
    }, { status: 500 });
  }
}
