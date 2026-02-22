export function replacePlaceholders(body: string, order: any): string {
  if (!body) return '';
  let result = body;
  
  const placeholders: Record<string, string> = {
    '<customer_name>': order.customerName || '',
    '<order_id>': order.id?.slice(-6) || '',
    '<order_price>': order.totalPrice?.toString() || order.totalFines?.toString() || '0',
    '<service_name>': order.service?.name || '',
    '<variant_name>': order.variantName || '',
    '<status_text>': order.status || '',
    '<notes>': order.adminNotes || order.statusReason || '',
    '<work_order_number>': order.serialNumber || '',
    '<pickup_location>': order.pickupLocation || '',
    '<customer_phone>': order.customerPhone || '',
    '<customer_email>': order.customerEmail || '',
    '<password>': order.customerPhone || '',
    '<remaining_price>': ((order.totalPrice || order.totalFines || 0) - (order.totalPaid || 0)).toString(),
  };

  Object.entries(placeholders).forEach(([tag, val]) => {
    // Escape tag for regex just in case
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedTag, 'g'), val || '');
  });

  return result;
}
