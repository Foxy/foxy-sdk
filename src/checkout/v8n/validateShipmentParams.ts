import { SHIPPING_BASE_REQUIRED_KEYS, SHIPPING_FIELDS } from './addressConfig';
import type { AddressInput, AddressOptions, DisplayRules, ValidationError } from './internalTypes';
import { validateProvidedAddressFields } from './validateProvidedAddressFields';

/**
 * Validates a shipping address mutation. Only the fields present in the `params`
 * object are checked; missing fields are not treated as errors here.
 */
export function validateShipmentParams(
  params: AddressInput,
  display: DisplayRules,
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
