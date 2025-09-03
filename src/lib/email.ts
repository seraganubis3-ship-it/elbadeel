import nodemailer from "nodemailer";
import type { SentMessageInfo } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || "587", 10);
const secure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : port === 465; // 465 = SSL/TLS, 587 = STARTTLS
const requireTLS = process.env.SMTP_REQUIRE_TLS
  ? process.env.SMTP_REQUIRE_TLS === "true"
  : port === 587; // often required for 587
const connectionTimeout = parseInt(process.env.SMTP_CONNECTION_TIMEOUT || "10000", 10);
const greetingTimeout = parseInt(process.env.SMTP_GREETING_TIMEOUT || "10000", 10);
const socketTimeout = parseInt(process.env.SMTP_SOCKET_TIMEOUT || "20000", 10);
const tlsRejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTH
  ? process.env.SMTP_TLS_REJECT_UNAUTH !== "false"
  : true;

// Create transporter
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout,
  greetingTimeout,
  socketTimeout,
  tls: {
    rejectUnauthorized: tlsRejectUnauthorized,
  },
});

export async function sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
  try {
    if (process.env.NODE_ENV !== "production") {
      // Minimal debug (without leaking password)
      console.log("[SMTP] Connecting", {
        host,
        port,
        secure,
        requireTLS,
        user: process.env.SMTP_USER,
      });
    }

    const mailOptions = {
      from: `"منصة البديل" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// For development/testing without real SMTP
export async function sendEmailDev(options: EmailOptions): Promise<{ messageId: string }> {
  console.log("=== EMAIL SENT (DEV MODE) ===");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  console.log("Content:", options.html);
  console.log("===============================");
  
  // In development, just log the email instead of sending it
  return { messageId: "dev-" + Date.now() };
}

// Send if SMTP creds exist, otherwise fallback to dev logging
export async function sendEmailSafe(options: EmailOptions): Promise<SentMessageInfo | { messageId: string }> {
  console.log("=== DEBUG: Checking environment variables ===");
  console.log("SMTP_USER:", process.env.SMTP_USER ? "EXISTS" : "MISSING");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "EXISTS" : "MISSING");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("=============================================");
  
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("✅ Sending REAL email");
    return sendEmail(options);
  }
  console.log("❌ Falling back to DEV MODE");
  return sendEmailDev(options);
}

// Generate verification code (6 digits)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code email
export async function sendVerificationCodeEmail(email: string, name: string, code: string): Promise<SentMessageInfo | { messageId: string }> {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">تأكيد البريد الإلكتروني - منصة البديل</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          مرحباً ${name}،
        </p>
        <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          شكراً لك على التسجيل في منصة البديل. يرجى استخدام الكود التالي لتأكيد بريدك الإلكتروني:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #ffffff; border: 3px solid #059669; border-radius: 10px; padding: 20px; display: inline-block; min-width: 200px;">
            <div style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
        </div>
        <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          <strong>ملاحظات مهمة:</strong>
        </p>
        <ul style="color: #000000; font-size: 14px; line-height: 1.6; margin-bottom: 20px; padding-right: 20px;">
          <li>هذا الكود صالح لمدة 10 دقائق فقط</li>
          <li>لا تشارك هذا الكود مع أي شخص</li>
          <li>إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #111827; font-size: 12px; text-align: center;">
          منصة البديل - خدمات استخراج الأوراق الرسمية
        </p>
      </div>
    </div>
  `;

  return sendEmailSafe({
    to: email,
    subject: "كود تأكيد البريد الإلكتروني - منصة البديل",
    html,
  });
}
