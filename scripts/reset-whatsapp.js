const fs = require('fs');
const path = require('path');

const SESSION_DIR = path.join(__dirname, '..', 'baileys_auth_info');

console.log('🔄 Checking WhatsApp Session...');

if (fs.existsSync(SESSION_DIR)) {
  console.log(`Found session directory at: ${SESSION_DIR}`);
  try {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    console.log('✅ Session files deleted successfully.');
    console.log('👉 Please restart the bot using: pm2 restart haiba-whatsapp');
  } catch (err) {
    console.error('❌ Error deleting session:', err.message);
  }
} else {
  console.log('ℹ️ No session directory found. You are ready to scan QR code.');
}
