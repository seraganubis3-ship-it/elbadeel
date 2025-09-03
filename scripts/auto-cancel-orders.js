#!/usr/bin/env node

/**
 * Script لإلغاء الطلبات التي لم يتم دفعها خلال 30 دقيقة
 * يمكن تشغيله من cron job كل 5 دقائق
 */

const https = require('https');
const http = require('http');

// إعدادات
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  apiKey: process.env.CRON_API_KEY || 'your-secret-key',
  endpoint: '/api/cron/auto-cancel-orders'
};

// دالة لإرسال طلب HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const request = client.request(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: response.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: response.statusCode, data: data });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      request.write(options.body);
    }
    
    request.end();
  });
}

// الدالة الرئيسية
async function autoCancelOrders() {
  try {
    console.log(`[${new Date().toISOString()}] بدء عملية الإلغاء التلقائي للطلبات...`);
    
    const url = `${config.apiUrl}${config.endpoint}`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'User-Agent': 'AutoCancelCron/1.0'
      }
    };
    
    const response = await makeRequest(url, options);
    
    if (response.status === 200) {
      console.log(`✅ نجح الإلغاء التلقائي:`, response.data.message);
      console.log(`📊 عدد الطلبات الملغية: ${response.data.cancelledCount}`);
      
      if (response.data.cancelledOrders && response.data.cancelledOrders.length > 0) {
        console.log('📋 تفاصيل الطلبات الملغية:');
        response.data.cancelledOrders.forEach(order => {
          console.log(`   - ${order.id}: ${order.customerName} (${order.totalAmount} جنيه)`);
        });
      }
      
      console.log(`⏰ التالي: ${response.data.nextRun}`);
    } else {
      console.error(`❌ فشل الإلغاء التلقائي: HTTP ${response.status}`);
      console.error('Response:', response.data);
    }
    
  } catch (error) {
    console.error(`❌ خطأ في الإلغاء التلقائي:`, error.message);
    
    // إرسال إشعار للمطور (اختياري)
    if (process.env.NOTIFICATION_WEBHOOK) {
      try {
        await makeRequest(process.env.NOTIFICATION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `❌ فشل الإلغاء التلقائي للطلبات: ${error.message}`,
            timestamp: new Date().toISOString()
          })
        });
      } catch (notifyError) {
        console.error('فشل في إرسال الإشعار:', notifyError.message);
      }
    }
  }
}

// تشغيل الدالة
if (require.main === module) {
  autoCancelOrders().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('خطأ غير متوقع:', error);
    process.exit(1);
  });
}

module.exports = { autoCancelOrders };
