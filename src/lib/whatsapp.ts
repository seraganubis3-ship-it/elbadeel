// WhatsApp API Client for Next.js
// This file provides functions to send WhatsApp messages through the bot service

// When running on the server (API routes), we can connect directly to the bot port
// When running on the client (browser), we should NOT use this URL directly, but go through our Next.js API proxies
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'http://127.0.0.1:4000';

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
// NOTE: This function is primarily for SERVER-SIDE use.
// For client-side checks, use /api/admin/whatsapp/status
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

import { getParsedMessage } from './whatsapp-templates';

// Send message based on trigger
export async function sendWhatsAppByTrigger(
  trigger: string,
  order: any
): Promise<WhatsAppResponse> {
  try {
    const message = await getParsedMessage(trigger, order);
    if (!message) return { success: false, error: `No active template found for trigger: ${trigger}` };

    const phone = order.customerPhone || order.user?.phone;
    if (!phone) return { success: false, error: 'No phone number found' };

    return await sendWhatsAppMessage({ phone, message });
  } catch (error) {
    console.error('sendWhatsAppByTrigger error:', error);
    return { success: false, error: 'Failed to send WhatsApp by trigger' };
  }
}

// Pre-built notification messages (DEPRECATED: Prefer database templates)
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

  // Welcome message for new customers (first order)
  welcomeNewCustomer: (
    customerName: string,
    orderId: string,
    serviceName: string,
    amount: number,
    phone: string
  ) => ({
    message:
      `🎉 *أهلاً بك في مكتب البديل!*\n\n` +
      `مرحباً *${customerName}* 👋\n\n` +
      `تم تسجيلك بنجاح في مكتب البديل للخدمات الحكومية\n\n` +
      `📋 *تفاصيل طلبك الأول:*\n` +
      `• رقم الطلب: #${orderId}\n` +
      `• الخدمة: ${serviceName}\n` +
      `• المبلغ: ${(amount / 100).toFixed(2)} جنيه\n\n` +
      `🔐 *بيانات تسجيل الدخول:*\n` +
      `• رقم الهاتف: ${phone}\n` +
      `• كلمة المرور: ${phone}\n\n` +
      `🌐 *رابط الموقع:*\n` +
      `https://albadel.com.eg\n\n` +
      `يمكنك تسجيل الدخول لمتابعة طلبك في أي وقت\n\n` +
      `شكراً لثقتك في مكتب البديل 🏢`,
  }),

  // Custom message
  custom: (customerName: string, text: string) => ({
    message:
      `🏢 *منصة البديل*\n\n` + `مرحباً *${customerName}* 👋\n\n` + `${text}\n\n` + `🌐 منصة البديل`,
  }),
};
