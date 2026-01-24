/**
 * مساعد لتنسيق وتحويل تاريخ العمل
 */

export function formatWorkDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseWorkDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // تحويل من DD/MM/YYYY إلى Date
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      if (!day || !month || !year) return null;

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    }

    // محاولة تحويل مباشر إذا كان بصيغة أخرى
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    return null;
  }
}

export function getTodayAsWorkDate(): string {
  return formatWorkDate(new Date());
}
