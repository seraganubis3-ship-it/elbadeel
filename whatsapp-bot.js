
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const cors = require('cors');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// ================== BAILEYS SETUP ==================

let sock;
let qrCodeData = null;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  
  console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true, // Print QR in terminal for easy scanning
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    // Fix for high load/instability
    browser: ['Ofa Admin', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeData = qr;
      console.log('Scan this QR code to login:');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      
      if (shouldReconnect) {
        startWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
      qrCodeData = null;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// ================== API ROUTES ==================

// Check health/status
app.get('/health', (req, res) => {
  res.json({
    status: sock?.user ? 'connected' : 'disconnected',
    qrRequired: !sock?.user,
    user: sock?.user,
    qrCode: qrCodeData,
  });
});

// Get QR Code Image
app.get('/qr', async (req, res) => {
  const isConnected = !!sock?.user;
  let qrImage = null;
  
  if (!isConnected && qrCodeData) {
    try {
      qrImage = await QRCode.toDataURL(qrCodeData);
    } catch (err) {
      console.error('QR Gen Error', err);
    }
  }

  res.json({
    status: isConnected ? 'connected' : (qrCodeData ? 'qr_ready' : 'loading'),
    qrRequired: !isConnected,
    user: sock?.user,
    qrImage: qrImage,
    message: isConnected ? 'تم الاتصال بنجاح' : (qrCodeData ? 'امسح الكود' : 'جاري التحميل...')
  });
});

// Send text message
app.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!sock?.user) {
    return res.status(503).json({ success: false, error: 'WhatsApp not connected' });
  }

  try {
    const formattedPhone = formatToWhatsappId(phone);
    // Add 1s delay to seem human
    await delay(1000); 
    const sentMsg = await sock.sendMessage(formattedPhone, { text: message });
    res.json({ success: true, messageId: sentMsg.key.id });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send image
app.post('/send-image', async (req, res) => {
  const { phone, imageUrl, caption } = req.body;

  if (!sock?.user) {
    return res.status(503).json({ success: false, error: 'WhatsApp not connected' });
  }

  try {
    const formattedPhone = formatToWhatsappId(phone);
    await sock.sendMessage(formattedPhone, {
      image: { url: imageUrl },
      caption: caption || '',
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Send image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Format phone number
function formatToWhatsappId(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '20' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return cleaned + '@s.whatsapp.net';
}

// Start Server & Bot
const server = app.listen(PORT, () => {
  console.log(`WhatsApp API running on port ${PORT}`);
  startWhatsApp();
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down WhatsApp Bot...');
  if (sock) {
    try {
      await sock.end(undefined);
      sock = null;
    } catch (e) {
      console.error('Error closing socket:', e);
    }
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
