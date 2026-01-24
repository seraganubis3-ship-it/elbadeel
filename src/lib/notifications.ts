// Notification system to replace WhatsApp functionality
import { sendEmailSafe } from './email';
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from '@/constants/orderStatuses';

export interface NotificationData {
  to: string;
  subject: string;
  message: string;
  type: 'email' | 'sms' | 'push';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  status: string;
  totalAmount: number;
  adminNotes?: string;
}

// Send order status notification
export async function sendOrderStatusNotification(data: OrderNotificationData): Promise<boolean> {
  try {
    const { customerName, customerEmail, serviceName, status, totalAmount, orderId } = data;

    // Use centralized status config
    const statusMessage = ORDER_STATUS_CONFIG[status]?.label || 'تم تحديث حالة طلبك';

    const emailContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">تحديث حالة الطلب - منصة البديل</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            مرحباً ${customerName}،
          </p>
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${statusMessage} للخدمة: <strong>${serviceName}</strong>
          </p>
          <div style="background: #ffffff; border: 2px solid #059669; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">تفاصيل الطلب</h3>
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>الخدمة:</strong> ${serviceName}</p>
            <p><strong>المبلغ الإجمالي:</strong> ${(totalAmount / 100).toFixed(2)} جنيه</p>
            <p><strong>الحالة:</strong> ${statusMessage}</p>
          </div>
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            يمكنك متابعة حالة طلبك من خلال حسابك على المنصة.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://albadil.com/orders" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              متابعة الطلبات
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #111827; font-size: 12px; text-align: center;">
            منصة البديل - خدمات استخراج الأوراق الرسمية
          </p>
        </div>
      </div>
    `;

    await sendEmailSafe({
      to: customerEmail,
      subject: `تحديث حالة الطلب - ${serviceName}`,
      html: emailContent,
    });

    return true;
  } catch {
    return false;
  }
}

// Send payment confirmation
export async function sendPaymentConfirmation(data: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
}): Promise<boolean> {
  try {
    const { customerName, customerEmail, orderId, amount, paymentMethod } = data;

    const emailContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">تأكيد الدفع - منصة البديل</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            مرحباً ${customerName}،
          </p>
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            تم استلام دفعتك بنجاح وسيتم البدء في تنفيذ طلبك.
          </p>
          <div style="background: #ffffff; border: 2px solid #059669; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">تفاصيل الدفع</h3>
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>المبلغ المدفوع:</strong> ${(amount / 100).toFixed(2)} جنيه</p>
            <p><strong>طريقة الدفع:</strong> ${paymentMethod}</p>
            <p><strong>تاريخ الدفع:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            شكراً لثقتك في منصة البديل. سنقوم بإنجاز طلبك في أقرب وقت ممكن.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #111827; font-size: 12px; text-align: center;">
            منصة البديل - خدمات استخراج الأوراق الرسمية
          </p>
        </div>
      </div>
    `;

    await sendEmailSafe({
      to: customerEmail,
      subject: 'تأكيد الدفع - منصة البديل',
      html: emailContent,
    });

    return true;
  } catch {
    return false;
  }
}

// Send verification code
export async function sendVerificationCode(
  email: string,
  name: string,
  code: string
): Promise<boolean> {
  try {
    const emailContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">كود التحقق - منصة البديل</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            مرحباً ${name}،
          </p>
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            استخدم الكود التالي للتحقق من حسابك:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #ffffff; border: 3px solid #059669; border-radius: 10px; padding: 20px; display: inline-block; min-width: 200px;">
              <div style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </div>
            </div>
          </div>
          <p style="color: #000000; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            <strong>ملاحظة:</strong> هذا الكود صالح لمدة 10 دقائق فقط ولا تشاركه مع أي شخص.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #111827; font-size: 12px; text-align: center;">
            منصة البديل - خدمات استخراج الأوراق الرسمية
          </p>
        </div>
      </div>
    `;

    await sendEmailSafe({
      to: email,
      subject: 'كود التحقق - منصة البديل',
      html: emailContent,
    });

    return true;
  } catch {
    return false;
  }
}

// Send admin notification
export async function sendAdminNotification(data: {
  type: 'new_order' | 'payment_received' | 'order_completed';
  orderId: string;
  customerName: string;
  serviceName: string;
  amount?: number;
}): Promise<boolean> {
  try {
    const { type, orderId, customerName, serviceName, amount } = data;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@albadil.com';

    const typeMessages = {
      new_order: 'طلب جديد',
      payment_received: 'دفعة مستلمة',
      order_completed: 'طلب مكتمل',
    };

    const message = typeMessages[type];

    const emailContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">إشعار إداري - ${message}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
          <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${message} في منصة البديل
          </p>
          <div style="background: #ffffff; border: 2px solid #dc2626; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">تفاصيل الإشعار</h3>
            <p><strong>نوع الإشعار:</strong> ${message}</p>
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>اسم العميل:</strong> ${customerName}</p>
            <p><strong>الخدمة:</strong> ${serviceName}</p>
            ${amount ? `<p><strong>المبلغ:</strong> ${(amount / 100).toFixed(2)} جنيه</p>` : ''}
            <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-EG')}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://albadil.com/admin/orders" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              عرض في لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    `;

    await sendEmailSafe({
      to: adminEmail,
      subject: `إشعار إداري - ${message}`,
      html: emailContent,
    });

    return true;
  } catch {
    return false;
  }
}
