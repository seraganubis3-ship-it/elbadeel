/**
 * Utility to evaluate conditional logic for dynamic fields and documents.
 * Supports AND logic for multiple conditions.
 */

export type Operator = 'eq' | 'neq' | 'gt' | 'lt' | 'contains';

export interface Condition {
  field: string;
  op: Operator;
  value: string;
}

export type LogicRule = Record<string, string>; // Legacy format: { field: "operatorValue" }

/**
 * Parses a string value encoded with an operator prefix into a Condition object.
 * e.g., ">18" -> { op: 'gt', value: '18' }
 */
export const parseConditionValue = (field: string, encodedValue: string): Condition => {
  let val = String(encodedValue);
  let op: Operator = 'eq';

  if (val.startsWith('>')) {
    op = 'gt';
    val = val.substring(1);
  } else if (val.startsWith('<')) {
    op = 'lt';
    val = val.substring(1);
  } else if (val.startsWith('!')) {
    op = 'neq';
    val = val.substring(1);
  } else if (val.startsWith('*')) {
    op = 'contains';
    val = val.substring(1);
  }

  return { field, op, value: val };
};

/**
 * Normalizes Arabic text for more robust comparison.
 * Handles variations of Alef and Teh Marbuta.
 */
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text).trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');
};

/**
 * Evaluates a set of conditions against providing values.
 * All conditions must be true (AND logic).
 */
export const evaluateLogic = (
  logicJson: string | null | undefined,
  currentValues: Record<string, string | number | boolean | undefined | null>
): boolean => {
  if (!logicJson) return true;

  try {
    const data = JSON.parse(logicJson);
    let conditions: Condition[] = [];

    if (Array.isArray(data)) {
      // New format: Array of Condition objects
      conditions = data;
    } else if (typeof data === 'object' && data !== null) {
      // Legacy format: { field: "operatorValue" }
      conditions = Object.entries(data).map(([field, val]) =>
        parseConditionValue(field, val as string)
      );
    }

    if (conditions.length === 0) return true;

    // Temporary debug log to find out why matches are failing
    // console.log('EVAL LOGIC:', JSON.stringify({ conditions, currentValues }, null, 2));

    return conditions.every(condition => {
      const actualValueRaw = currentValues[condition.field];
      const actualValue = String(actualValueRaw || '');
      const targetValue = String(condition.value || '');

      const isMatch = (() => {
        switch (condition.op) {
          case 'eq': {
            // Check for numeric range "min-max"
            const rangeMatch = targetValue.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
            if (rangeMatch && !isNaN(parseFloat(actualValue))) {
              const min = parseFloat(rangeMatch[1] as string);
              const max = parseFloat(rangeMatch[2] as string);
              const actualNum = parseFloat(actualValue);
              return actualNum >= min && actualNum <= max;
            }
            return normalizeText(actualValue) === normalizeText(targetValue);
          }
          case 'neq':
            return normalizeText(actualValue) !== normalizeText(targetValue);
          case 'gt': {
            const actualNum = parseFloat(actualValue);
            const targetNum = parseFloat(targetValue);
            return !isNaN(actualNum) && !isNaN(targetNum) && actualNum > targetNum;
          }
          case 'lt': {
            const actualNum = parseFloat(actualValue);
            const targetNum = parseFloat(targetValue);
            return !isNaN(actualNum) && !isNaN(targetNum) && actualNum < targetNum;
          }
          case 'contains': {
            const normTarget = normalizeText(targetValue);
            if (normTarget === '') return false;
            return normalizeText(actualValue).includes(normTarget);
          }
          default:
            return normalizeText(actualValue) === normalizeText(targetValue);
        }
      })();

      // console.log(`EVAL COND: ${condition.field} ${condition.op} ${condition.value} | actual: ${actualValue} | match: ${isMatch}`);
      return isMatch;
    });
  } catch (error) {
    // console.error('Logic Evaluation Error:', error);
    return true; // Default to visible on error to avoid blocking users
  }
};
