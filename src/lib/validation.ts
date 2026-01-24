import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('بريد إلكتروني غير صحيح');

export const passwordSchema = z
  .string()
  .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  .max(100, 'كلمة المرور طويلة جداً');

export const phoneSchema = z
  .string()
  .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل')
  .max(15, 'رقم الهاتف طويل جداً')
  .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح');

export const nameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(50, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم يجب أن يحتوي على أحرف عربية فقط');

export const idNumberSchema = z
  .string()
  .length(14, 'الرقم القومي يجب أن يكون 14 رقم')
  .regex(/^[0-9]+$/, 'الرقم القومي يجب أن يحتوي على أرقام فقط');

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  idNumber: idNumberSchema,
});

export const orderSchema = z.object({
  customerName: nameSchema,
  customerPhone: phoneSchema,
  customerEmail: emailSchema,
  address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
  notes: z.string().optional(),
  deliveryType: z.enum(['OFFICE', 'ADDRESS']),
  quantity: z.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
});

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل').optional(),
  governorate: z.string().min(2, 'المحافظة مطلوبة').optional(),
  city: z.string().min(2, 'المدينة مطلوبة').optional(),
  birthDate: z.string().optional(),
  fatherName: nameSchema.optional(),
  motherName: nameSchema.optional(),
  nationality: z.string().min(2, 'الجنسية مطلوبة').optional(),
  wifeName: nameSchema.optional(),
});

// Validation helper functions
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach(err => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'حدث خطأ في التحقق من البيانات' } };
  }
}

// Real-time validation
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): string | null {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues.find(
        (err: any) => err.path.length === 1 && err.path[0] === fieldName
      );
      return fieldError ? fieldError.message : null;
    }
    return 'قيمة غير صحيحة';
  }
}

// Custom validation functions
export const validators = {
  // Email validation
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'البريد الإلكتروني مطلوب';
    if (!emailRegex.test(value)) return 'بريد إلكتروني غير صحيح';
    return null;
  },

  // Phone validation
  phone: (value: string) => {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!value) return 'رقم الهاتف مطلوب';
    if (value.length < 10) return 'رقم الهاتف قصير جداً';
    if (value.length > 15) return 'رقم الهاتف طويل جداً';
    if (!phoneRegex.test(value)) return 'رقم الهاتف غير صحيح';
    return null;
  },

  // Name validation
  name: (value: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!value) return 'الاسم مطلوب';
    if (value.length < 2) return 'الاسم قصير جداً';
    if (value.length > 50) return 'الاسم طويل جداً';
    if (!arabicRegex.test(value)) return 'الاسم يجب أن يحتوي على أحرف عربية فقط';
    return null;
  },

  // ID Number validation
  idNumber: (value: string) => {
    const numberRegex = /^[0-9]+$/;
    if (!value) return 'الرقم القومي مطلوب';
    if (value.length !== 14) return 'الرقم القومي يجب أن يكون 14 رقم';
    if (!numberRegex.test(value)) return 'الرقم القومي يجب أن يحتوي على أرقام فقط';
    return null;
  },

  // Password validation
  password: (value: string) => {
    if (!value) return 'كلمة المرور مطلوبة';
    if (value.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (value.length > 100) return 'كلمة المرور طويلة جداً';
    return null;
  },

  // Confirm password validation
  confirmPassword: (value: string, password: string) => {
    if (!value) return 'تأكيد كلمة المرور مطلوب';
    if (value !== password) return 'كلمات المرور غير متطابقة';
    return null;
  },

  // Required field validation
  required: (value: string) => {
    if (!value || value.trim() === '') return 'هذا الحقل مطلوب';
    return null;
  },

  // Min length validation
  minLength: (value: string, min: number) => {
    if (!value) return 'هذا الحقل مطلوب';
    if (value.length < min) return `يجب أن يكون ${min} أحرف على الأقل`;
    return null;
  },

  // Max length validation
  maxLength: (value: string, max: number) => {
    if (value && value.length > max) return `يجب أن يكون ${max} أحرف على الأكثر`;
    return null;
  },
};
