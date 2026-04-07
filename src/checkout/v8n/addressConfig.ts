import type { AddressField } from './internalTypes';

export type AddressConstraint = {
  maxLength?: number;
  exactLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

/** Fields that must always be present for a shipping address to be structurally valid. */
export const SHIPPING_BASE_REQUIRED_KEYS = new Set([
  'shipto_first_name',
  'shipto_last_name',
  'shipto_address1',
  'shipto_city',
  'shipto_region',
  'shipto_postal_code',
  'shipto_country',
]);

/** Fields that must always be present for a billing address to be structurally valid. */
export const BILLING_BASE_REQUIRED_KEYS = new Set([
  'billing_first_name',
  'billing_last_name',
  'billing_address1',
  'billing_city',
  'billing_region',
  'billing_postal_code',
  'billing_country',
]);

export const SHIPPING_FIELDS: AddressField[] = [
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

export const BILLING_FIELDS: AddressField[] = [
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

export const ADDRESS_CONSTRAINTS: Record<string, AddressConstraint> = {
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
