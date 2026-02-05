const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting Simple Bot...');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'test-client',
        dataPath: '.simple-auth'
    }),
    puppeteer: {
        headless: false, // Show the browser
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('⚡ QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ Client is ready!');
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.initialize();
