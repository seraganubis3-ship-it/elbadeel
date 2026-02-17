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
 * Evaluates a set of conditions against providing values.
 * All conditions must be true (AND logic).
 */
export const evaluateLogic = (
  logicJson: string | null | undefined,
  currentValues: Record<string, string | number | boolean | undefined | null>
): boolean => {
  if (!logicJson) return true;

  try {
    const rules: LogicRule = JSON.parse(logicJson);
    const conditions = Object.entries(rules).map(([field, val]) => parseConditionValue(field, val));

    return conditions.every(condition => {
      const actualValueRaw = currentValues[condition.field];
      const actualValue =
        actualValueRaw !== undefined && actualValueRaw !== null ? String(actualValueRaw) : '';
      const targetValue = condition.value;

      switch (condition.op) {
        case 'eq':
          return actualValue === targetValue;
        case 'neq':
          return actualValue !== targetValue;
        case 'gt':
          return parseFloat(actualValue) > parseFloat(targetValue);
        case 'lt':
          return parseFloat(actualValue) < parseFloat(targetValue);
        case 'contains':
          return actualValue.toLowerCase().includes(targetValue.toLowerCase());
        default:
          return actualValue === targetValue;
      }
    });
  } catch (error) {
    // console.error('Logic Evaluation Error:', error);
    return true; // Default to visible on error to avoid blocking users
  }
};
