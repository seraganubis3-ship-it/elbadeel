import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL ||
  process.env.NEXT_PUBLIC_WHATSAPP_API_URL ||
  'http://127.0.0.1:4000';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { phone, message } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف مطلوب' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'الرسالة فارغة' }, { status: 400 });
    }

    // Check WhatsApp bot status first
    try {
      const statusResponse = await fetch(`${WHATSAPP_API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const status = await statusResponse.json();

      if (status.status !== 'connected') {
        return NextResponse.json(
          {
            success: false,
            error: 'بوت الواتساب غير متصل. يرجى مسح QR Code أولاً من صفحة إدارة الواتساب.',
          },
          { status: 503 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'تعذر الاتصال ببوت الواتساب. تأكد من تشغيله.' },
        { status: 503 }
      );
    }

    // Send the message
    const response = await fetch(`${WHATSAPP_API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        messageId: data.messageId,
        message: 'تم إرسال الرسالة بنجاح',
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'فشل إرسال الرسالة' },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    );
  }
}
