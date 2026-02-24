/**
 * Safely formats a date object or string into YYYY-MM-DD format for HTML date inputs.
 * Prevents "RangeError: Invalid time value" by validating the date first.
 */
export function formatDateForInput(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';

  try {
    const date = new Date(dateInput);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // toISOString() -> "YYYY-MM-DDTHH:mm:ss.sssZ"
    // split('T')[0] -> "YYYY-MM-DD"
    return date.toISOString().split('T')[0] || '';
  } catch (error) {
    return '';
  }
}

/**
 * Safely formats a date for localized display.
 */
export function safeLocaleDate(
  dateInput: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  if (!dateInput) return '----';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return '----';
    }
    return date.toLocaleDateString('ar-EG', options);
  } catch (error) {
    return '----';
  }
}
