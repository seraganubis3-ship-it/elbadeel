/**
 * مساعد للتعامل مع الأجازات الرسمية في مصر
 */

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

// قائمة الأجازات الثابتة والمعروفة لعام 2025-2026 (تاريخ تقريبي للأعياد الإسلامية)
export const EGYPTIAN_HOLIDAYS: Holiday[] = [
  // 2025
  { date: '2025-01-07', name: 'عيد الميلاد المجيد' },
  { date: '2025-01-25', name: 'عيد الثورة وعيد الشرطة' },
  { date: '2025-03-31', name: 'عيد الفطر المبارك (تقريبي)' },
  { date: '2025-04-01', name: 'عيد الفطر المبارك (تقريبي)' },
  { date: '2025-04-21', name: 'شم النسيم' },
  { date: '2025-04-25', name: 'عيد تحرير سيناء' },
  { date: '2025-05-01', name: 'عيد العمال' },
  { date: '2025-06-06', name: 'وقفة عرفات (تقريبي)' },
  { date: '2025-06-07', name: 'عيد الأضحى المبارك (تقريبي)' },
  { date: '2025-06-08', name: 'عيد الأضحى المبارك (تقريبي)' },
  { date: '2025-06-30', name: 'ثورة 30 يونيو' },
  { date: '2025-07-23', name: 'ثورة 23 يوليو' },
  { date: '2025-10-06', name: 'عيد القوات المسلحة' },

  // 2026
  { date: '2026-01-07', name: 'عيد الميلاد المجيد' },
  { date: '2026-01-25', name: 'عيد الثورة وعيد الشرطة' },
  { date: '2026-03-20', name: 'عيد الفطر المبارك (تقريبي)' },
  { date: '2026-03-21', name: 'عيد الفطر المبارك (تقريبي)' },
  { date: '2026-04-13', name: 'شم النسيم' },
  { date: '2026-04-25', name: 'عيد تحرير سيناء' },
  { date: '2026-05-01', name: 'عيد العمال' },
  { date: '2026-05-26', name: 'وقفة عرفات (تقريبي)' },
  { date: '2026-05-27', name: 'عيد الأضحى المبارك (تقريبي)' },
  { date: '2026-05-28', name: 'عيد الأضحى المبارك (تقريبي)' },
  { date: '2026-06-30', name: 'ثورة 30 يونيو' },
  { date: '2026-07-23', name: 'ثورة 23 يوليو' },
  { date: '2026-10-06', name: 'عيد القوات المسلحة' },
];

/**
 * جلب الأجازات من API خارجي مع استخدام القائمة الثابتة كاحتياطي
 */
export async function getEgyptianHolidays(year: number): Promise<string[]> {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/EG`);
    if (response.ok) {
      const data = await response.json();
      return data.map((h: any) => h.date);
    }
  } catch (error) {
    console.error('Failed to fetch holidays from API:', error);
  }

  // الاحتياطي
  return EGYPTIAN_HOLIDAYS.filter(h => h.date.startsWith(year.toString())).map(h => h.date);
}
