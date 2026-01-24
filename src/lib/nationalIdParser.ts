/**
 * Egyptian National ID Parser
 * استخراج البيانات من الرقم القومي المصري
 */

export interface NationalIdData {
  birthDate: string | null;
  governorate: string | null;
  governorateCode: string | null;
  century: number | null;
  year: number | null;
  month: number | null;
  day: number | null;
  gender: 'MALE' | 'FEMALE' | null;
  isValid: boolean;
  error?: string;
}

// خريطة المحافظات المصرية
const GOVERNORATE_CODES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
};

/**
 * تحقق من صحة الرقم القومي المصري
 */
export function validateNationalId(idNumber: string): boolean {
  // إزالة المسافات والرموز غير المرغوبة
  const cleanId = idNumber.replace(/\s/g, '');

  // التحقق من الطول (14 رقم)
  if (cleanId.length !== 14) {
    return false;
  }

  // التحقق من أن جميع الأرقام صحيحة
  if (!/^\d{14}$/.test(cleanId)) {
    return false;
  }

  return true;
}

/**
 * استخراج البيانات من الرقم القومي المصري
 */
export function parseNationalId(idNumber: string): NationalIdData {
  // إزالة المسافات والرموز غير المرغوبة
  const cleanId = idNumber.replace(/\s/g, '');

  // التحقق من صحة الرقم القومي
  if (!validateNationalId(cleanId)) {
    return {
      birthDate: null,
      governorate: null,
      governorateCode: null,
      century: null,
      year: null,
      month: null,
      day: null,
      gender: null,
      isValid: false,
      error: 'الرقم القومي غير صحيح. يجب أن يكون 14 رقم',
    };
  }

  try {
    // استخراج الأرقام
    const centuryDigit = parseInt(cleanId[0] || '0');
    const yearDigits = parseInt(cleanId.substring(1, 3));
    const monthDigits = parseInt(cleanId.substring(3, 5));
    const dayDigits = parseInt(cleanId.substring(5, 7));
    const governorateCode = cleanId.substring(7, 9);

    // تحديد القرن والسنة
    let century: number;
    let fullYear: number;

    if (centuryDigit === 2) {
      century = 1900;
      fullYear = 1900 + yearDigits;
    } else if (centuryDigit === 3) {
      century = 2000;
      fullYear = 2000 + yearDigits;
    } else {
      return {
        birthDate: null,
        governorate: null,
        governorateCode: null,
        century: null,
        year: null,
        month: null,
        day: null,
        gender: null,
        isValid: false,
        error: 'الرقم الأول غير صحيح. يجب أن يكون 2 أو 3',
      };
    }

    // التحقق من صحة الشهر
    if (monthDigits < 1 || monthDigits > 12) {
      return {
        birthDate: null,
        governorate: null,
        governorateCode: null,
        century: null,
        year: null,
        month: null,
        day: null,
        gender: null,
        isValid: false,
        error: 'رقم الشهر غير صحيح',
      };
    }

    // التحقق من صحة اليوم
    if (dayDigits < 1 || dayDigits > 31) {
      return {
        birthDate: null,
        governorate: null,
        governorateCode: null,
        century: null,
        year: null,
        month: null,
        day: null,
        gender: null,
        isValid: false,
        error: 'رقم اليوم غير صحيح',
      };
    }

    // التحقق من صحة التاريخ
    const birthDate = new Date(fullYear, monthDigits - 1, dayDigits);
    if (
      birthDate.getFullYear() !== fullYear ||
      birthDate.getMonth() !== monthDigits - 1 ||
      birthDate.getDate() !== dayDigits
    ) {
      return {
        birthDate: null,
        governorate: null,
        governorateCode: null,
        century: null,
        year: null,
        month: null,
        day: null,
        gender: null,
        isValid: false,
        error: 'التاريخ غير صحيح',
      };
    }

    // التحقق من أن التاريخ ليس في المستقبل
    const today = new Date();
    if (birthDate > today) {
      return {
        birthDate: null,
        governorate: null,
        governorateCode: null,
        century: null,
        year: null,
        month: null,
        day: null,
        gender: null,
        isValid: false,
        error: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
      };
    }

    // الحصول على اسم المحافظة
    const governorate = GOVERNORATE_CODES[governorateCode] || null;

    // استخراج نوع الجنس من الرقم قبل الأخير (الرقم 12)
    const genderDigit = parseInt(cleanId[12] || '0');
    const gender: 'MALE' | 'FEMALE' = genderDigit % 2 === 0 ? 'FEMALE' : 'MALE';

    // تنسيق تاريخ الميلاد
    const formattedBirthDate = `${fullYear}-${monthDigits.toString().padStart(2, '0')}-${dayDigits.toString().padStart(2, '0')}`;

    return {
      birthDate: formattedBirthDate,
      governorate,
      governorateCode,
      century,
      year: fullYear,
      month: monthDigits,
      day: dayDigits,
      gender,
      isValid: true,
    };
  } catch (error) {
    return {
      birthDate: null,
      governorate: null,
      governorateCode: null,
      century: null,
      year: null,
      month: null,
      day: null,
      gender: null,
      isValid: false,
      error: 'خطأ في معالجة الرقم القومي',
    };
  }
}

/**
 * تنسيق تاريخ الميلاد للعرض
 */
export function formatBirthDateForDisplay(birthDate: string): string {
  if (!birthDate) return '';

  const date = new Date(birthDate);
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * تنسيق تاريخ الميلاد بصيغة dd mm yyyy
 */
export function formatBirthDateForInput(birthDate: string): string {
  if (!birthDate) return '';

  const date = new Date(birthDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * الحصول على قائمة المحافظات
 */
export function getGovernoratesList(): Array<{ code: string; name: string }> {
  return Object.entries(GOVERNORATE_CODES).map(([code, name]) => ({
    code,
    name,
  }));
}
