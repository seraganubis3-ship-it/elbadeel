import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_API_URL || 'http://127.0.0.1:4000';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${WHATSAPP_BOT_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Bot returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('WhatsApp Bot Status Error:', error);
    return NextResponse.json(
      { status: 'disconnected', error: 'Failed to connect to bot' },
      { status: 503 }
    );
  }
}
