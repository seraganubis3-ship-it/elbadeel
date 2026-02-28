import crypto from 'crypto';

interface CronAuthResult {
  isValid: boolean;
  error?: string;
}

export function verifyCronRequest(request: Request): CronAuthResult {
  const apiKey = process.env.CRON_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      error: 'CRON_API_KEY not configured',
    };
  }

  const signature = request.headers.get('x-cron-signature');
  const timestamp = request.headers.get('x-cron-timestamp');
  const providedApiKey = request.headers.get('x-api-key');

  // Support legacy API key check for backward compatibility
  if (providedApiKey === apiKey) {
    return { isValid: true };
  }

  // New HMAC signature verification
  if (!signature || !timestamp) {
    return {
      isValid: false,
      error: 'Missing required headers',
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);
  
  // Reject requests older than 5 minutes to prevent replay attacks
  if (now - requestTime > 300) {
    return {
      isValid: false,
      error: 'Request timestamp too old',
    };
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(timestamp)
    .digest('hex');

  if (signature !== expectedSignature) {
    return {
      isValid: false,
      error: 'Invalid signature',
    };
  }

  return { isValid: true };
}

export function generateCronSignature(): { signature: string; timestamp: string } {
  const apiKey = process.env.CRON_API_KEY;
  
  if (!apiKey) {
    throw new Error('CRON_API_KEY not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(timestamp)
    .digest('hex');

  return { signature, timestamp };
}
