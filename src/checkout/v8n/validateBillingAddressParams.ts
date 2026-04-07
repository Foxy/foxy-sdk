import { BILLING_BASE_REQUIRED_KEYS, BILLING_FIELDS } from './addressConfig';
import type { AddressInput, AddressOptions, DisplayRules, ValidationError } from './internalTypes';
import { validateProvidedAddressFields } from './validateProvidedAddressFields';

/**
 * Validates a billing address mutation. Only the fields present in the `params`
 * object are checked; missing fields are not treated as errors here.
 */
export function validateBillingAddressParams(
  params: AddressInput,
  display: DisplayRules,
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
