import { prisma } from './prisma';
import { ORDER_STATUS_CONFIG, OrderStatusKey } from '@/constants/orderStatus';

interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  totalCents: number;
  service: { name: string };
  variant: { name: string };
  status: string;
  adminNotes?: string | null;
  statusReason?: string | null;
  workOrderNumber?: string | null;
  pickupLocation?: string | null;
  user?: { phone: string; email: string } | null;
  payment?: { amount: number; status: string } | null;
  remainingAmount?: number;
}

export const PLACEHOLDERS = {
  CUSTOMER_NAME: '<customer_name>',
  ORDER_ID: '<order_id>',
  ORDER_PRICE: '<order_price>',
  SERVICE_NAME: '<service_name>',
  VARIANT_NAME: '<variant_name>',
  STATUS_TEXT: '<status_text>',
  NOTES: '<notes>',
  WORK_ORDER_NUMBER: '<work_order_number>',
  PICKUP_LOCATION: '<pickup_location>',
  CUSTOMER_PHONE: '<customer_phone>',
  CUSTOMER_EMAIL: '<customer_email>',
  REMAINING_PRICE: '<remaining_price>',
  PASSWORD: '<password>',
} as const;

/**
 * Replaces placeholders in a template string with actual order data.
 */
export function parseTemplate(template: string, order: OrderData): string {
  let message = template;

  const statusText = ORDER_STATUS_CONFIG[order.status as OrderStatusKey]?.text || order.status;
  const price = (order.totalCents / 100).toFixed(2);
  const shortId = order.id.slice(-6).toUpperCase();

  const replacements: Record<string, string> = {
    [PLACEHOLDERS.CUSTOMER_NAME]: order.customerName || '',
    [PLACEHOLDERS.ORDER_ID]: shortId,
    [PLACEHOLDERS.ORDER_PRICE]: price,
    [PLACEHOLDERS.SERVICE_NAME]: order.service?.name || '',
    [PLACEHOLDERS.VARIANT_NAME]: order.variant?.name || '',
    [PLACEHOLDERS.STATUS_TEXT]: statusText,
    [PLACEHOLDERS.NOTES]: order.statusReason || order.adminNotes || '',
    [PLACEHOLDERS.WORK_ORDER_NUMBER]: order.workOrderNumber || '',
    [PLACEHOLDERS.PICKUP_LOCATION]: order.pickupLocation || '',
    [PLACEHOLDERS.CUSTOMER_PHONE]: order.customerPhone || order.user?.phone || '',
    [PLACEHOLDERS.CUSTOMER_EMAIL]: order.customerEmail || order.user?.email || '',
    [PLACEHOLDERS.PASSWORD]: order.customerPhone || order.user?.phone || '', // Password is the phone number
  };

  // Calculate remaining price safely
  let remPriceNum = order.remainingAmount;
  if (remPriceNum === undefined && order.totalCents !== undefined) {
    const totalPaid =
      order.payment?.status === 'CONFIRMED' || order.payment?.status === 'PAID'
        ? order.payment.amount || 0
        : 0;
    remPriceNum = Math.max(0, (order.totalCents - totalPaid) / 100);
  }
  replacements[PLACEHOLDERS.REMAINING_PRICE] = (remPriceNum || 0).toFixed(2);

  // Expanded aliases for better UX
  const aliases: Record<string, string> = {
    '<customername>': replacements[PLACEHOLDERS.CUSTOMER_NAME] || '',
    '<orderid>': replacements[PLACEHOLDERS.ORDER_ID] || '',
    '<orderprice>': replacements[PLACEHOLDERS.ORDER_PRICE] || '',
    '<servicename>': replacements[PLACEHOLDERS.SERVICE_NAME] || '',
    '<variantname>': replacements[PLACEHOLDERS.VARIANT_NAME] || '',
    '<statustext>': replacements[PLACEHOLDERS.STATUS_TEXT] || '',
    '<phone>': replacements[PLACEHOLDERS.CUSTOMER_PHONE] || '',
    '<email>': replacements[PLACEHOLDERS.CUSTOMER_EMAIL] || '',
    '<password>': replacements[PLACEHOLDERS.PASSWORD] || '',
    '<remainingprice>': replacements[PLACEHOLDERS.REMAINING_PRICE] || '',
  };

  const finalReplacements = { ...replacements, ...aliases };

  Object.entries(finalReplacements).forEach(([placeholder, value]) => {
    // Escape placeholder for regex safety
    const safePlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safePlaceholder, 'gi');
    message = message.replace(regex, String(value ?? ''));
  });

  return message;
}

/**
 * Fetches a template by trigger and parses it.
 * Returns null if no active template is found for the trigger.
 */
export async function getParsedMessage(trigger: string, order: any): Promise<string | null> {
  const template = await (prisma as any).whatsAppTemplate.findFirst({
    where: {
      trigger,
      active: true,
    },
    orderBy: {
      orderIndex: 'asc',
    },
  });

  if (!template) return null;

  return parseTemplate(template.body, order);
}
