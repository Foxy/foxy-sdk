import type { CustomFields } from '../types';

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function validateCustomFields(fields: CustomFields): string[] {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!key.startsWith('h:')) {
      errors.push(`Invalid custom field key "${key}". Keys must start with "h:".`);
    }

    if (typeof value !== 'string') {
      errors.push(`Invalid value for custom field "${key}". Value must be a string.`);
    }
  }

  return errors;
}
