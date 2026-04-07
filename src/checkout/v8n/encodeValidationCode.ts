export type ValidationCodePayload = {
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

export function encodeValidationCode(payload: ValidationCodePayload): string {
  return `${V8N_CODE_PREFIX}${JSON.stringify(payload)}`;
}
