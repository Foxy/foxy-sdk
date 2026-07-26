import { ADDRESS_CONSTRAINTS } from './addressConfig';
import { encodeValidationCode } from './encodeValidationCode';
import type { AddressField, AddressInput, AddressOptions, DisplayRules, ValidationError } from './internalTypes';

/**
 * Validates address fields that are explicitly provided in a params object.
 * Only checks fields present in `params` — this is intentional, as address
 * mutations are partial (one field at a time). Full-form completeness is
 * enforced at submit time by the state manager.
 *
 * A field fails validation when it is explicitly set to an empty string and
 * either belongs to the base-required set or is marked required via display rules.
 */
export function validateProvidedAddressFields(
  params: AddressInput,
  fields: AddressField[],
  baseRequired: Set<string>,
  display: DisplayRules,
  context: string,
  options: AddressOptions = {}
): ValidationError[] {
  const errors: ValidationError[] = [];
  const required = new Set([...baseRequired, ...display.required_form_fields]);
  const hidden = new Set(display.hidden_form_fields);

  for (const { key, displayKey } of fields) {
    if (!(key in params)) continue;

    const value = params[key];
    const trimmed = value?.trim() ?? '';

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

    // Consumers normalize the submitted value to uppercase before sending it
    // (and `toCountryOptions` uppercases every option value it produces), but
    // `allowedValues` here is the raw, unmodified server list — a store
    // emitting lowercase `country_options`/`region_options` must not have
    // every edit rejected client-side. Case-fold and trim both sides for the
    // membership check only; `trimmed` itself (used below for constraint
    // checks, and by the caller for the outgoing payload) is left untouched.
    if (
      allowedValues &&
      allowedValues.length > 0 &&
      !allowedValues.some((allowedValue) => allowedValue.trim().toUpperCase() === trimmed.toUpperCase())
    ) {
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
