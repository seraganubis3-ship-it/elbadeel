import { EGYPTIAN_HOLIDAYS } from './holidays';

/**
 * حساب تاريخ التسليم المتوقع مع استبعاد أيام الجمعة والأجازات الرسمية
 * @param startDate تاريخ البداية
 * @param etaDays عدد أيام العمل المطلوبة
 * @returns تاريخ التسليم المتوقع
 */
export function calculateEstimatedDeliveryDate(startDate: Date, etaDays: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;

  // استخراج قائمة تواريخ الأجازات بصيغة YYYY-MM-DD للمقارنة السريعة
  const holidayDates = new Array(...EGYPTIAN_HOLIDAYS.map(h => h.date));

  while (daysAdded < etaDays) {
    // إضافة يوم واحد
    result.setDate(result.getDate() + 1);

    const dayOfWeek = result.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const dateStr = result.toISOString().split('T')[0]!;

    // استبعاد الجمعة (الأجازة الأسبوعية) والأجازات الرسمية
    const isFriday = dayOfWeek === 5;
    const isHoliday = holidayDates.includes(dateStr);

    if (!isFriday && !isHoliday) {
      daysAdded++;
    }
  }

  return result;
}

/**
 * تنسيق التاريخ للعرض بالعربية
 */
export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
