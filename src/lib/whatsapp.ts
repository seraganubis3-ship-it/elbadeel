// WhatsApp API Client for Next.js
// This file provides functions to send WhatsApp messages through the bot service

const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://127.0.0.1:4000';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

export interface OrderNotification {
  phone: string;
  customerName: string;
  orderId: string;
  serviceName: string;
  status: string;
  totalAmount?: number;
  adminNotes?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Check if WhatsApp bot is connected
export async function checkWhatsAppStatus(): Promise<{ status: string; qrRequired: boolean }> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch {
    return { status: 'offline', qrRequired: false };
  }
}

// Send a simple text message
export async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Failed to connect to WhatsApp service' };
  }
}

// Send order status notification
export async function sendOrderNotification(data: OrderNotification): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/send-order-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Failed to connect to WhatsApp service' };
  }
}

// Send image with caption
export async function sendWhatsAppImage(
  phone: string,
  imageUrl: string,
  caption?: string
): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/send-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, imageUrl, caption }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Failed to connect to WhatsApp service' };
  }
}

// Pre-built notification messages
export const NotificationTemplates = {
  // New order created
  newOrder: (customerName: string, orderId: string, serviceName: string, amount: number) => ({
    message:
      `🏢 *منصة البديل*\n\n` +
      `مرحباً *${customerName}* 👋\n\n` +
      `✅ تم استلام طلبك بنجاح!\n\n` +
      `📋 *تفاصيل الطلب:*\n` +
      `• رقم الطلب: #${orderId}\n` +
      `• الخدمة: ${serviceName}\n` +
      `• المبلغ: ${(amount / 100).toFixed(2)} جنيه\n\n` +
      `سنقوم بالتواصل معك قريباً.\n\n` +
      `🌐 منصة البديل`,
  }),

  // Order ready for pickup
  orderReady: (customerName: string, orderId: string, serviceName: string) => ({
    message:
      `🏢 *منصة البديل*\n\n` +
      `مرحباً *${customerName}* 👋\n\n` +
      `🎉 *طلبك جاهز للاستلام!*\n\n` +
      `📋 *تفاصيل الطلب:*\n` +
      `• رقم الطلب: #${orderId}\n` +
      `• الخدمة: ${serviceName}\n\n` +
      `📍 يمكنك استلام طلبك من مكتبنا.\n\n` +
      `🌐 منصة البديل`,
  }),

  // Order delivered
  orderDelivered: (customerName: string, orderId: string, serviceName: string) => ({
    message:
      `🏢 *منصة البديل*\n\n` +
      `مرحباً *${customerName}* 👋\n\n` +
      `✅ *تم تسليم طلبك بنجاح!*\n\n` +
      `📋 رقم الطلب: #${orderId}\n` +
      `📌 الخدمة: ${serviceName}\n\n` +
      `شكراً لثقتك في منصة البديل 🙏\n\n` +
      `🌐 منصة البديل`,
  }),

  // Payment reminder
  paymentReminder: (customerName: string, orderId: string, amount: number) => ({
    message:
      `🏢 *منصة البديل*\n\n` +
      `مرحباً *${customerName}* 👋\n\n` +
      `💰 *تذكير بالدفع*\n\n` +
      `📋 رقم الطلب: #${orderId}\n` +
      `💵 المبلغ المتبقي: ${(amount / 100).toFixed(2)} جنيه\n\n` +
      `يرجى سداد المبلغ لاستكمال الطلب.\n\n` +
      `🌐 منصة البديل`,
  }),

  // Custom message
  custom: (customerName: string, text: string) => ({
    message:
      `🏢 *منصة البديل*\n\n` + `مرحباً *${customerName}* 👋\n\n` + `${text}\n\n` + `🌐 منصة البديل`,
  }),
};
