// WhatsApp Service using whatsapp-web.js
// This runs as a separate process and exposes an API for sending messages

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// WhatsApp Client Configuration
let client = null;
let isReady = false;
let qrCodeData = null;
let qrCodeImage = null;
let connectionInfo = null;

// Initialize WhatsApp Client
function initializeClient() {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
    webVersion: '2.2413.51-beta',
    webVersionCache: {
      type: 'remote',
      remotePath:
        'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
    },
  });

  // QR Code Event
  client.on('qr', async qr => {
    qrCodeData = qr;
    // Generate QR as base64 image for web display
    try {
      qrCodeImage = await QRCode.toDataURL(qr, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch (err) {
      console.error('Error generating QR image:', err);
    }
    console.log('\n📱 امسح الـ QR Code ده من تليفونك:\n');
    qrcodeTerminal.generate(qr, { small: true });
    console.log('\n⏳ في انتظار المسح...\n');
  });

  // Ready Event
  client.on('ready', async () => {
    isReady = true;
    qrCodeData = null;
    qrCodeImage = null;

    // Get connection info
    try {
      const info = client.info;
      connectionInfo = {
        phoneNumber: info.wid.user,
        name: info.pushname,
        platform: info.platform,
      };
      console.log(`✅ متصل كـ: ${info.pushname} (${info.wid.user})`);
    } catch (err) {
      console.log('✅ WhatsApp Bot جاهز للعمل! 🚀');
    }
    console.log('📡 API متاح على: http://localhost:3001');
  });

  // Authentication Success
  client.on('authenticated', () => {
    console.log('🔐 تم التحقق بنجاح!');
  });

  // Authentication Failure
  client.on('auth_failure', msg => {
    console.error('❌ فشل في التحقق:', msg);
    isReady = false;
    connectionInfo = null;
  });

  // Disconnected
  client.on('disconnected', reason => {
    console.log('🔌 تم قطع الاتصال:', reason);
    isReady = false;
    qrCodeData = null;
    qrCodeImage = null;
    connectionInfo = null;

    // Reconnect after 10 seconds with a fresh instance
    console.log('🔄 جاري التحضير لإعادة الاتصال في خلال 10 ثوانٍ...');
    setTimeout(() => {
      console.log('🔄 إعادة تشغيل البوت...');
      initializeClient();
    }, 10000);
  });

  // Message received (for testing)
  client.on('message', async msg => {
    // Skip group messages and status updates
    if (msg.from.endsWith('@g.us') || msg.from === 'status@broadcast') {
      return;
    }

    console.log(`📩 رسالة من ${msg.from}: ${msg.body}`);

    // Auto-reply for testing
    if (msg.body.toLowerCase() === '!test') {
      msg.reply('✅ البوت شغال! - منصة البديل');
    }

    if (msg.body.toLowerCase() === '!ping') {
      msg.reply('🏓 Pong! - منصة البديل');
    }
  });

  // Initialize
  client.initialize();
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Egyptian numbers
  if (cleaned.startsWith('0')) {
    cleaned = '20' + cleaned.substring(1);
  }

  // Add country code if missing
  if (!cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }

  return cleaned + '@c.us';
}

// ================== API ENDPOINTS ==================

// Health check with full status
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({
    status: isReady ? 'connected' : 'disconnected',
    qrRequired: !isReady && qrCodeData !== null,
    loading: !isReady && qrCodeData === null,
    connectionInfo: connectionInfo,
  });
});

// Get QR Code as base64 image for web display
app.get('/qr', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  if (isReady) {
    res.json({
      status: 'connected',
      message: 'WhatsApp متصل بالفعل',
      connectionInfo: connectionInfo,
    });
  } else if (qrCodeImage) {
    res.json({
      status: 'qr_ready',
      qrImage: qrCodeImage,
      message: 'امسح الـ QR Code من تطبيق WhatsApp',
    });
  } else {
    res.json({
      status: 'loading',
      message: 'جاري تحميل WhatsApp... انتظر قليلاً',
    });
  }
});

// Send text message
app.post('/send', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp غير متصل. امسح الـ QR Code أولاً.',
      });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف والرسالة مطلوبين',
      });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const rawNumber = formattedPhone.replace('@c.us', '').replace(/\D/g, '');
    const numberId = await client.getNumberId(rawNumber);
    if (!numberId) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير مسجل على واتساب',
      });
    }
    const result = await client.sendMessage(numberId._serialized, message);

    console.log(`✅ رسالة مرسلة إلى ${phone}`);

    res.json({
      success: true,
      messageId: result.id._serialized,
      to: phone,
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send order notification
app.post('/send-order-notification', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp غير متصل',
      });
    }

    const { phone, customerName, orderId, serviceName, status, totalAmount, adminNotes } = req.body;

    if (!phone || !customerName || !serviceName) {
      return res.status(400).json({
        success: false,
        error: 'بيانات ناقصة',
      });
    }

    // Status messages matching ORDER_STATUS constants
    const statusMessages = {
      WAITING_CONFIRMATION: 'تم استلام طلبك',
      WAITING_PAYMENT: 'في انتظار الدفع',
      PARTIAL_PAYMENT: 'تم استلام دفعة جزئية',
      PAYMENT_CONFIRMED: 'تم تأكيد الدفع',
      SETTLEMENT: 'في انتظار التسديد',
      FULFILLMENT: 'جاري العمل على طلبك',
      SUPPLY: 'قيد التوريد',
      READY: 'طلبك جاهز للاستلام',
      DELIVERED: 'تم تسليم طلبك',
      RETURNED: 'تم إرجاع طلبك',
      CANCELLED: 'تم إلغاء طلبك',
      // Legacy aliases for backwards compatibility
      PENDING: 'تم استلام طلبك',
      IN_PROGRESS: 'جاري العمل على طلبك',
      COMPLETED: 'تم تسليم طلبك',
    };

    const statusText = statusMessages[status] || 'تم تحديث طلبك';

    // Build message
    let message = `🏢 *منصة البديل*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;
    message += `مرحباً *${customerName}* 👋\n\n`;
    message += `📋 *${statusText}*\n\n`;
    message += `📌 *تفاصيل الطلب:*\n`;
    message += `• رقم الطلب: #${orderId}\n`;
    message += `• الخدمة: ${serviceName}\n`;

    if (totalAmount) {
      message += `• المبلغ: ${(totalAmount / 100).toFixed(2)} جنيه\n`;
    }

    if (adminNotes) {
      message += `\n💬 *ملاحظات:*\n${adminNotes}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `📞 للاستفسار: اتصل بنا\n`;
    message += `🌐 منصة البديل`;

    const formattedPhone = formatPhoneNumber(phone);
    const rawNumber = formattedPhone.replace('@c.us', '').replace(/\D/g, '');
    const numberId = await client.getNumberId(rawNumber);
    if (!numberId) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير مسجل على واتساب',
      });
    }
    const result = await client.sendMessage(numberId._serialized, message);

    console.log(`✅ إشعار طلب مرسل إلى ${customerName} (${phone})`);

    res.json({
      success: true,
      messageId: result.id._serialized,
    });
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send image with caption
app.post('/send-image', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp غير متصل',
      });
    }

    const { phone, imageUrl, caption } = req.body;

    if (!phone || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف ورابط الصورة مطلوبين',
      });
    }

    const media = await MessageMedia.fromUrl(imageUrl);
    const formattedPhone = formatPhoneNumber(phone);
    const rawNumber = formattedPhone.replace('@c.us', '').replace(/\D/g, '');
    const numberId = await client.getNumberId(rawNumber);
    if (!numberId) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف غير مسجل على واتساب',
      });
    }
    const result = await client.sendMessage(numberId._serialized, media, {
      caption: caption || '',
    });

    res.json({
      success: true,
      messageId: result.id._serialized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    if (client) {
      await client.logout();
      isReady = false;
      qrCodeData = null;
      res.json({ success: true, message: 'تم تسجيل الخروج' });
    } else {
      res.json({ success: false, message: 'لا يوجد اتصال' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.WHATSAPP_PORT || 3001;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 WhatsApp Bot - منصة البديل        ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   📡 API: http://localhost:${PORT}        ║`);
  console.log('║   ⏳ جاري تشغيل WhatsApp...             ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Initialize WhatsApp Client
  initializeClient();
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 إيقاف البوت...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});
