import type { Display } from '../types';

export type ValidationError = {
  context: string;
  message: string;
};

export type AddressField = {
  key: string;
  displayKey: string;
  label: string;
};

export type AddressInput = Record<string, string | null | undefined>;

export type AddressOptions = {
  countryOptions?: string[];
  regionOptions?: string[];
};

export type DisplayRules = Pick<Display, 'required_form_fields' | 'hidden_form_fields'>;
