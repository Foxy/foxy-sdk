/** Union of all possible auth error codes. */
export type AuthErrorCode =
  | 'NEW_PASSWORD_REQUIRED'
  | 'INVALID_NEW_PASSWORD'
  | 'UNAUTHORIZED'
  | 'INVALID_FORM'
  | 'UNAVAILABLE'
  | 'UNKNOWN'
  | 'TOKEN_REFRESH_FAILED';

const AUTH_ERROR_CODES: readonly AuthErrorCode[] = [
  'NEW_PASSWORD_REQUIRED',
  'INVALID_NEW_PASSWORD',
  'UNAUTHORIZED',
  'INVALID_FORM',
  'UNAVAILABLE',
  'UNKNOWN',
  'TOKEN_REFRESH_FAILED',
];

const STORAGE_METHODS = ['clear', 'getItem', 'key', 'removeItem', 'setItem'] as const;

/**
 * Throws a `TypeError` with a consistent message.
 *
 * @param label Name of the value being checked.
 * @param expectation Description of what was expected.
 * @throws Always.
 */
function fail(label: string, expectation: string): never {
  throw new TypeError(`${label} must be ${expectation}.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function checkOptionalString(value: unknown, label: string, maxLength?: number): void {
  if (value === undefined) return;
  if (typeof value !== 'string') fail(label, 'a string');
  if (maxLength !== undefined && value.length > maxLength) fail(label, `at most ${maxLength} characters long`);
}

function checkRequiredString(value: unknown, label: string, maxLength?: number): void {
  if (typeof value !== 'string') fail(label, 'a string');
  if (maxLength !== undefined && value.length > maxLength) fail(label, `at most ${maxLength} characters long`);
}

/**
 * Checks that a value implements the Web Storage API.
 *
 * @param value Value to check.
 * @param label Name of the value, used in the error message.
 * @throws TypeError when the value is not storage-shaped.
 */
export function assertStorage(value: unknown, label: string): void {
  if (!isRecord(value)) fail(label, 'a Web Storage implementation');
  if (typeof (value as Storage).length !== 'number') fail(label, 'a Web Storage implementation');

  for (const method of STORAGE_METHODS) {
    if (typeof (value as unknown as Record<string, unknown>)[method] !== 'function') {
      fail(label, 'a Web Storage implementation');
    }
  }
}

/**
 * Checks the init object of the core API class.
 *
 * @param value Value to check.
 * @throws TypeError when any member is of the wrong type.
 */
export function assertCoreAPIInit(value: unknown): void {
  if (!isRecord(value)) fail('init', 'an object');

  const { base, cache, fetch, level, storage } = value;

  if (!(base instanceof URL)) fail('init.base', 'an instance of URL');
  if (cache !== undefined) assertStorage(cache, 'init.cache');
  if (storage !== undefined) assertStorage(storage, 'init.storage');
  if (fetch !== undefined && typeof fetch !== 'function') fail('init.fetch', 'a function');
  if (level !== undefined && !Number.isInteger(level)) fail('init.level', 'an integer');
}

/**
 * Checks a curie chain: a URL followed by any number of curies.
 *
 * @param value Value to check.
 * @throws TypeError when the value is not a valid curie chain.
 */
export function assertCurieChain(value: unknown): void {
  if (!Array.isArray(value)) fail('path', 'an array');
  if (!(value[0] instanceof URL)) fail('path[0]', 'an instance of URL');
  if (!isStringArray(value.slice(1))) fail('path', 'a URL followed by curies');
}

/**
 * Checks a single curie.
 *
 * @param value Value to check.
 * @throws TypeError when the value is not a string.
 */
export function assertCurie(value: unknown): void {
  if (typeof value !== 'string') fail('curie', 'a string');
}

/**
 * Checks hAPI query parameters.
 *
 * @param value Value to check, or `undefined` for no query.
 * @throws TypeError when any parameter is of the wrong type.
 */
export function assertQuery(value: unknown): void {
  if (value === undefined) return;
  if (!isRecord(value)) fail('query', 'an object');

  const { fields, filters, limit, offset, order, zoom } = value;

  if (fields !== undefined && !isStringArray(fields)) fail('query.fields', 'an array of strings');
  if (filters !== undefined && !isStringArray(filters)) fail('query.filters', 'an array of strings');
  if (limit !== undefined && typeof limit !== 'number') fail('query.limit', 'a number');
  if (offset !== undefined && typeof offset !== 'number') fail('query.offset', 'a number');

  for (const [key, param] of [
    ['order', order],
    ['zoom', zoom],
  ] as const) {
    if (param === undefined) continue;
    const ok = typeof param === 'string' || Array.isArray(param) || isRecord(param);
    if (!ok) fail(`query.${key}`, 'a string, an array or an object');
  }
}

/**
 * Checks the constructor parameters of the auth error class.
 *
 * @param value Value to check.
 * @throws TypeError when the code is missing or unknown.
 */
export function assertAuthErrorParams(value: unknown): void {
  if (!isRecord(value)) fail('params', 'an object');
  if (!AUTH_ERROR_CODES.includes(value.code as AuthErrorCode)) {
    fail('params.code', `one of ${AUTH_ERROR_CODES.join(', ')}`);
  }
}

/**
 * Checks customer credentials.
 *
 * @param value Value to check.
 * @throws TypeError when email or password is missing or of the wrong type.
 */
export function assertCredentials(value: unknown): void {
  if (!isRecord(value)) fail('credentials', 'an object');
  checkRequiredString(value.email, 'credentials.email');
  checkRequiredString(value.password, 'credentials.password');
  checkOptionalString(value.newPassword, 'credentials.newPassword');
}

/**
 * Checks customer sign-up parameters.
 *
 * @param value Value to check.
 * @throws TypeError when any member is missing or of the wrong type.
 */
export function assertSignUpParams(value: unknown): void {
  if (!isRecord(value)) fail('params', 'an object');

  const { email, first_name: firstName, last_name: lastName, password, verification } = value;

  checkRequiredString(email, 'params.email', 100);
  checkOptionalString(firstName, 'params.first_name', 50);
  checkOptionalString(lastName, 'params.last_name', 50);
  checkOptionalString(password, 'params.password', 50);

  if (!isRecord(verification)) fail('params.verification', 'an object');
  checkRequiredString(verification.token, 'params.verification.token');
  if (verification.type !== 'hcaptcha') fail('params.verification.type', '"hcaptcha"');
}

/**
 * Checks an email address argument.
 *
 * @param value Value to check.
 * @throws TypeError when the value is not a string.
 */
export function assertEmail(value: unknown): void {
  checkRequiredString(value, 'email');
}

/**
 * Checks a boolean argument.
 *
 * @param value Value to check.
 * @param label Name of the value, used in the error message.
 * @throws TypeError when the value is not a boolean.
 */
export function assertBoolean(value: unknown, label: string): void {
  if (typeof value !== 'boolean') fail(label, 'a boolean');
}

/**
 * Checks the Admin-specific fields of the Admin API constructor params
 * (`clientId`/`clientSecret`/`refreshToken`/`version`). The shared
 * `base`/`cache`/`storage`/`level` fields are intentionally left to
 * `assertCoreAPIInit`, which `Core.API`'s own constructor already runs —
 * duplicating that check here would just repeat the same validation twice.
 *
 * @param value Value to check.
 * @throws TypeError when any member is of the wrong type.
 */
export function assertAdminAPIInit(value: unknown): void {
  if (!isRecord(value)) fail('init', 'an object');

  const { clientId, clientSecret, refreshToken, version } = value;

  checkRequiredString(clientId, 'init.clientId');
  checkRequiredString(clientSecret, 'init.clientSecret');
  checkRequiredString(refreshToken, 'init.refreshToken');
  if (version !== undefined && version !== '1') fail('init.version', '"1"');
}

/**
 * Checks the options passed to Admin API's static `getToken()` method.
 *
 * @param value Value to check.
 * @throws TypeError when any member is of the wrong type, or neither `code` nor `refreshToken` is present.
 */
export function assertAdminGetTokenOpts(value: unknown): void {
  if (!isRecord(value)) fail('opts', 'an object');

  const { base, clientId, clientSecret, code, refreshToken, version } = value;

  if (code === undefined && refreshToken === undefined) {
    fail('opts', 'an object with a "code" or "refreshToken" property');
  }
  if (code !== undefined) checkRequiredString(code, 'opts.code');
  if (refreshToken !== undefined) checkRequiredString(refreshToken, 'opts.refreshToken');
  checkRequiredString(clientId, 'opts.clientId');
  checkRequiredString(clientSecret, 'opts.clientSecret');
  if (base !== undefined && !(base instanceof URL)) fail('opts.base', 'an instance of URL');
  if (version !== undefined && version !== '1') fail('opts.version', '"1"');
}

/**
 * Checks the options passed to `createSSOURL()`.
 *
 * @param value Value to check.
 * @throws TypeError when any member is of the wrong type.
 */
export function assertSSOURLOptions(value: unknown): void {
  if (!isRecord(value)) fail('options', 'an object');

  const { customer, domain, secret, session, timestamp } = value;

  if (typeof customer !== 'number') fail('options.customer', 'a number');
  checkRequiredString(domain, 'options.domain');
  checkRequiredString(secret, 'options.secret');
  checkOptionalString(session, 'options.session');
  if (timestamp !== undefined && typeof timestamp !== 'number') fail('options.timestamp', 'a number');
}

/**
 * Checks the webhook payload passed to `verifyWebhookSignature()`.
 *
 * @param value Value to check.
 * @throws TypeError when any member is missing or of the wrong type.
 */
export function assertWebhookSignaturePayload(value: unknown): void {
  if (!isRecord(value)) fail('webhook', 'an object');
  checkRequiredString(value.key, 'webhook.key');
  checkRequiredString(value.payload, 'webhook.payload');
  checkRequiredString(value.signature, 'webhook.signature');
}
