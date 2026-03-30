import type { CustomFields, Display } from '../types';

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

export type ValidationError = {
  context: string;
  message: string;
};

type ValidationCodePayload = {
  code:
    | 'address.required'
    | 'address.invalid_option'
    | 'address.max_length'
    | 'address.exact_length'
    | 'address.invalid_format';
  field: string;
  values?: Record<string, string | number | boolean | null | undefined>;
};

const V8N_CODE_PREFIX = '__v8n_code__:';

function encodeValidationCode(payload: ValidationCodePayload): string {
  return `${V8N_CODE_PREFIX}${JSON.stringify(payload)}`;
}

type AddressField = {
  key: string;
  displayKey: string;
  label: string;
};

/** Fields that must always be present for a shipping address to be structurally valid. */
const SHIPPING_BASE_REQUIRED_KEYS = new Set([
  'shipto_first_name',
  'shipto_last_name',
  'shipto_address1',
  'shipto_city',
  'shipto_region',
  'shipto_postal_code',
  'shipto_country',
]);

/** Fields that must always be present for a billing address to be structurally valid. */
const BILLING_BASE_REQUIRED_KEYS = new Set([
  'billing_first_name',
  'billing_last_name',
  'billing_address1',
  'billing_city',
  'billing_region',
  'billing_postal_code',
  'billing_country',
]);

const SHIPPING_FIELDS: AddressField[] = [
  { key: 'first_name', displayKey: 'shipto_first_name', label: 'First name' },
  { key: 'last_name', displayKey: 'shipto_last_name', label: 'Last name' },
  { key: 'company', displayKey: 'shipto_company', label: 'Company' },
  { key: 'phone', displayKey: 'shipto_phone', label: 'Phone' },
  { key: 'address1', displayKey: 'shipto_address1', label: 'Street address' },
  { key: 'address2', displayKey: 'shipto_address2', label: 'Address line 2' },
  { key: 'city', displayKey: 'shipto_city', label: 'City' },
  { key: 'region', displayKey: 'shipto_region', label: 'State / Province' },
  { key: 'postal_code', displayKey: 'shipto_postal_code', label: 'Postal code' },
  { key: 'country', displayKey: 'shipto_country', label: 'Country' },
];

const BILLING_FIELDS: AddressField[] = [
  { key: 'first_name', displayKey: 'billing_first_name', label: 'First name' },
  { key: 'last_name', displayKey: 'billing_last_name', label: 'Last name' },
  { key: 'company', displayKey: 'billing_company', label: 'Company' },
  { key: 'phone', displayKey: 'billing_phone', label: 'Phone' },
  { key: 'address1', displayKey: 'billing_address1', label: 'Street address' },
  { key: 'address2', displayKey: 'billing_address2', label: 'Address line 2' },
  { key: 'city', displayKey: 'billing_city', label: 'City' },
  { key: 'region', displayKey: 'billing_region', label: 'State / Province' },
  { key: 'postal_code', displayKey: 'billing_postal_code', label: 'Postal code' },
  { key: 'country', displayKey: 'billing_country', label: 'Country' },
];

type AddressInput = Record<string, string | null | undefined>;

type AddressOptions = {
  countryOptions?: string[];
  regionOptions?: string[];
};

type AddressConstraint = {
  maxLength?: number;
  exactLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

const ADDRESS_CONSTRAINTS: Record<string, AddressConstraint> = {
  first_name: { maxLength: 50 },
  last_name: { maxLength: 50 },
  company: { maxLength: 50 },
  address1: { maxLength: 100 },
  address2: { maxLength: 100 },
  city: { maxLength: 50 },
  region: { maxLength: 50 },
  postal_code: { maxLength: 50 },
  country: { maxLength: 50 },
  phone: { maxLength: 50 },
};

/**
 * Validates address fields that are explicitly provided in a params object.
 * Only checks fields present in `params` — this is intentional, as address
 * mutations are partial (one field at a time).  Full-form completeness is
 * enforced at submit time by the state manager.
 *
 * A field fails validation when it is explicitly set to an empty string and
 * either belongs to the base-required set or is marked required via display rules.
 */
function validateProvidedAddressFields(
  params: AddressInput,
  fields: AddressField[],
  baseRequired: Set<string>,
  display: Pick<Display, 'required_form_fields' | 'hidden_form_fields'>,
  context: string,
  options: AddressOptions = {}
): ValidationError[] {
  const errors: ValidationError[] = [];
  const required = new Set([...baseRequired, ...display.required_form_fields]);
  const hidden = new Set(display.hidden_form_fields);

  for (const { key, displayKey, label } of fields) {
    if (!(key in params)) continue; // not being set in this call

    const value = params[key];
    const trimmed = value?.trim() ?? '';

    // Hidden fields are not required in checkout display logic, but if provided
    // they still must satisfy API-level format/length constraints.
    if (!hidden.has(displayKey) && required.has(displayKey) && !trimmed) {
      errors.push({
        context,
        message: encodeValidationCode({
          code: 'address.required',
          field: key,
        }),
      });
      continue;
    }

    if (!trimmed) continue;

    const allowedValues =
      key === 'country' ? options.countryOptions : key === 'region' ? options.regionOptions : undefined;

    if (allowedValues && allowedValues.length > 0 && !allowedValues.includes(trimmed)) {
      errors.push({
        context,
        message: encodeValidationCode({
          code: 'address.invalid_option',
          field: key,
        }),
      });
      continue;
    }

    const constraint = ADDRESS_CONSTRAINTS[key];
    if (!constraint) continue;

    if (constraint.maxLength && trimmed.length > constraint.maxLength) {
      errors.push({
        context,
        message: encodeValidationCode({
          code: 'address.max_length',
          field: key,
          values: { max: constraint.maxLength },
        }),
      });
    }

    const hasExactLengthViolation = !!constraint.exactLength && trimmed.length !== constraint.exactLength;

    if (hasExactLengthViolation) {
      errors.push({
        context,
        message: encodeValidationCode({
          code: 'address.exact_length',
          field: key,
          values: { length: constraint.exactLength },
        }),
      });
    }

    if (constraint.pattern && !hasExactLengthViolation && !constraint.pattern.test(trimmed)) {
      errors.push({
        context,
        message: encodeValidationCode({
          code: 'address.invalid_format',
          field: key,
        }),
      });
    }
  }

  return errors;
}

/**
 * Validates a shipping address mutation. Only the fields present in the `params`
 * object are checked; missing fields are not treated as errors here.
 */
export function validateShipmentParams(
  params: AddressInput,
  display: Pick<Display, 'required_form_fields' | 'hidden_form_fields'>,
  options?: AddressOptions
): ValidationError[] {
  return validateProvidedAddressFields(
    params,
    SHIPPING_FIELDS,
    SHIPPING_BASE_REQUIRED_KEYS,
    display,
    'shipment-update',
    options
  );
}

/**
 * Validates a billing address mutation. Only the fields present in the `params`
 * object are checked; missing fields are not treated as errors here.
 */
export function validateBillingAddressParams(
  params: AddressInput,
  display: Pick<Display, 'required_form_fields' | 'hidden_form_fields'>,
  options?: AddressOptions
): ValidationError[] {
  return validateProvidedAddressFields(
    params,
    BILLING_FIELDS,
    BILLING_BASE_REQUIRED_KEYS,
    display,
    'billing-address-update',
    options
  );
}

// Re-export field metadata for consumers that need display-key mappings.
export { SHIPPING_FIELDS, BILLING_FIELDS, SHIPPING_BASE_REQUIRED_KEYS, BILLING_BASE_REQUIRED_KEYS };
