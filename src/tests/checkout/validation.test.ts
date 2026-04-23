import { isNonNegativeInteger, isPositiveInteger, isValidEmail, validateCustomFields } from '../../checkout/v8n';

describe('Checkout validation', () => {
  it('validates email addresses', () => {
    expect(isValidEmail('hello@example.com')).toBe(true);
    expect(isValidEmail('hello')).toBe(false);
  });

  it('validates integer helpers', () => {
    expect(isPositiveInteger(1)).toBe(true);
    expect(isPositiveInteger(0)).toBe(false);
    expect(isNonNegativeInteger(0)).toBe(true);
    expect(isNonNegativeInteger(-1)).toBe(false);
  });

  it('validates custom field keys and values', () => {
    expect(validateCustomFields({ 'h:test': 'value' })).toEqual([]);
    expect(validateCustomFields({ 'test': 'value', 'h:count': (1 as unknown) as string })).toEqual([
      'Invalid custom field key "test". Keys must start with "h:".',
      'Invalid value for custom field "h:count". Value must be a string.',
    ]);
  });
});
