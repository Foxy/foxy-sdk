type CodesDict = {
  [key: number]: {
    code: string;
    parent: string;
  };
};

const CART_URL = '/cart?';

/**
 * Names Foxy's own cart/checkout population fields use — these are never
 * signed, since they're meant to be freely settable by the page (e.g.
 * pre-filling a customer's address), not authenticated product data.
 */
export const cartExcludes: readonly string[] = [
  // Analytics values
  '_',
  '_ga',
  '_ke',
  // Cart values
  'cart',
  'fcsid',
  'empty',
  'coupon',
  'output',
  'sub_token',
  'redirect',
  'callback',
  'locale',
  'template_set',
  // Checkout pre-population values
  'customer_email',
  'customer_first_name',
  'customer_last_name',
  'customer_address1',
  'customer_address2',
  'customer_city',
  'customer_state',
  'customer_postal_code',
  'customer_country',
  'customer_phone',
  'customer_company',
  'billing_first_name',
  'billing_last_name',
  'billing_address1',
  'billing_address2',
  'billing_city',
  'billing_postal_code',
  'billing_region',
  'billing_phone',
  'billing_company',
  'shipping_first_name',
  'shipping_last_name',
  'shipping_address1',
  'shipping_address2',
  'shipping_city',
  'shipping_state',
  'shipping_country',
  'shipping_postal_code',
  'shipping_region',
  'shipping_phone',
  'shipping_company',
];

export const cartExcludePrefixes: readonly string[] = ['h:', 'x:', '__', 'utm_'];

// SECURITY: `secret` below is the store's API key (the `webhook_key` field on
// the `fx:store` resource). These functions must only run in a trusted,
// authenticated context — e.g. a store admin's own dashboard session — and
// never in code served to or executed by end customers. Anyone who can read
// this secret can forge signatures Foxy's checkout will treat as authentic.

async function importSigningKey(secret: string): Promise<CryptoKey> {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new TypeError('No secret was provided to build the hmac');
  }

  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function computeMessage(key: CryptoKey, message: string): Promise<string> {
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function shouldSkipInput(name: string): boolean {
  const prefixStripped = name.replace(/^\d:/, '');
  return (
    cartExcludes.includes(prefixStripped) ||
    cartExcludePrefixes.some(
      p => name.toLowerCase().startsWith(p) || (name.startsWith('0:') && prefixStripped.toLowerCase().startsWith(p)),
    )
  );
}

function valueOrOpen(value: string | number | undefined): string | number {
  if (value === undefined || value === null || value === '') {
    return '--OPEN--';
  }
  return value;
}

function buildSignedName(name: string, signature: string, value?: string | number): string {
  const open = valueOrOpen(value) == '--OPEN--' ? '||open' : '';
  return `${name}||${signature}${open}`;
}

function buildSignedValue(signature: string, value?: string | number): string {
  const open = valueOrOpen(value) == '--OPEN--' ? '||open' : (value as string);
  return `${open}||${signature}`;
}

function buildSignedQueryArg(name: string, signature: string, value: string | number): string {
  return `${name}||${signature}=${value}`;
}

function isSigned(url: string): boolean {
  return url.match(/^.*\|\|[0-9a-fA-F]{64}/) != null;
}

function getCodeFromURL(url: URL): string | undefined {
  for (const p of url.searchParams) {
    if (p[0] == 'code') {
      return p[1];
    }
  }
}

function findCartForms(doc: ParentNode): HTMLFormElement[] {
  return Array.from(doc.querySelectorAll('form')).filter(e => e.querySelector('[name=code]')) as HTMLFormElement[];
}

function splitNamePrefix(name: string): [number, string] {
  const namePrefix = name.split(':');
  if (namePrefix.length == 2) {
    return [parseInt(namePrefix[0], 10), namePrefix[1]];
  }
  return [0, name];
}

function retrieveParentCode(formElement: Element, prefix: string | number = ''): string {
  let result = '';
  const separator = prefix ? ':' : '';
  const parentCodeEl = formElement.querySelector(`[name='${prefix}${separator}parent_code']`);
  if (parentCodeEl) {
    const parentCode = parentCodeEl.getAttribute('value');
    if (parentCode !== null) {
      result = parentCode;
    }
  }
  return result;
}

async function signProduct(key: CryptoKey, code: string, name: string, value?: string | number): Promise<string> {
  return computeMessage(key, code + name + valueOrOpen(value));
}

async function signQueryArg(key: CryptoKey, name: string, code: string, value?: string): Promise<string> {
  name = name.replace(/ /g, '_');
  if (shouldSkipInput(name)) {
    return `${name}=${value}`;
  }
  code = code.replace(/ /g, '_');
  const signature = await signProduct(key, code, name, value);
  const encodedName = encodeURIComponent(name).replace(/%20/g, '+');
  const encodedValue = encodeURIComponent(valueOrOpen(value)).replace(/%20/g, '+');
  return buildSignedQueryArg(encodedName, signature, encodedValue);
}

async function signNameWithKey(
  key: CryptoKey,
  name: string,
  code: string,
  parentCode = '',
  value?: string | number,
): Promise<string> {
  name = name.replace(/ /g, '_');
  if (shouldSkipInput(name)) {
    return name;
  }
  const signature = await signProduct(key, code + parentCode, name, value);
  const encodedName = encodeURIComponent(name);
  return buildSignedName(encodedName, signature, value);
}

async function signValueWithKey(
  key: CryptoKey,
  name: string,
  code: string,
  parentCode = '',
  value?: string | number,
): Promise<string> {
  name = name.replace(/ /g, '_');
  if (shouldSkipInput(name)) {
    return value as string;
  }
  const signature = await signProduct(key, code + parentCode, name, value);
  return buildSignedValue(signature, value);
}

async function signInput(key: CryptoKey, el: HTMLInputElement, codes: CodesDict): Promise<HTMLInputElement> {
  const [prefix, nameString] = splitNamePrefix(el.name);
  const code = codes[prefix].code;
  const parentCode = codes[prefix].parent;
  const value = el.value;
  const signedName = await signNameWithKey(key, nameString, code, parentCode, value);
  el.setAttribute('name', prefix + ':' + signedName);
  return el;
}

async function signTextArea(key: CryptoKey, el: HTMLTextAreaElement, codes: CodesDict): Promise<HTMLTextAreaElement> {
  const [prefix, nameString] = splitNamePrefix(el.name);
  const code = codes[prefix].code;
  const parentCode = codes[prefix].parent;
  const signedName = await signNameWithKey(key, nameString, code, parentCode, '');
  el.setAttribute('name', prefix + ':' + signedName);
  return el;
}

async function signOption(
  key: CryptoKey,
  el: HTMLOptionElement | HTMLInputElement,
  codes: CodesDict,
): Promise<HTMLOptionElement | HTMLInputElement> {
  let n = (el as HTMLInputElement).name;
  if (n === undefined) {
    const p = el.parentElement as HTMLSelectElement;
    n = p.name;
  }
  const [prefix, nameString] = splitNamePrefix(n);
  const code = codes[prefix].code;
  const parentCode = codes[prefix].parent;
  const value = el.value;
  const signedValue = await signValueWithKey(key, nameString, code, parentCode, value);
  el.setAttribute('value', prefix + ':' + signedValue);
  return el;
}

async function signRadio(key: CryptoKey, el: HTMLInputElement, codes: CodesDict): Promise<HTMLInputElement> {
  return signOption(key, el, codes) as Promise<HTMLInputElement>;
}

async function signSelect(key: CryptoKey, el: HTMLSelectElement, codes: CodesDict): Promise<HTMLSelectElement> {
  await Promise.all(Array.from(el.querySelectorAll('option')).map(opt => signOption(key, opt, codes)));
  return el;
}

async function signForm(key: CryptoKey, formElement: Element): Promise<void> {
  const codeList: NodeList = formElement.querySelectorAll('[name$=code]');
  const codes: CodesDict = {};

  for (const node of codeList) {
    const nameAttr = (node as Element).getAttribute('name');
    const codeValue = (node as Element).getAttribute('value') ?? '';
    if (nameAttr && nameAttr.match(/^([0-9]{1,3}:)?code/)) {
      const namePrefix = nameAttr.split(':');
      const prefix = parseInt(namePrefix[0]);
      if (namePrefix.length == 2) {
        codes[prefix] = {
          code: codeValue,
          parent: retrieveParentCode(formElement, prefix),
        };
      } else if (codes[0] === undefined) {
        codes[0] = {
          code: codeValue,
          parent: retrieveParentCode(formElement),
        };
      } else {
        const documentationURL = 'https://wiki.foxycart.com/v/2.0/hmac_validation#multiple_products_in_one_form';
        const errorMsg = `There are multiple codes in the form element. Please, check ${documentationURL}`;
        throw new Error(errorMsg);
      }
    }
  }

  const signings = [
    ...Array.from(formElement.querySelectorAll('input[name]')).map(i =>
      i.getAttribute('type') === 'radio'
        ? signRadio(key, i as HTMLInputElement, codes)
        : signInput(key, i as HTMLInputElement, codes),
    ),
    ...Array.from(formElement.querySelectorAll('select[name]')).map(s => signSelect(key, s as HTMLSelectElement, codes)),
    ...Array.from(formElement.querySelectorAll('textarea[name]')).map(s =>
      signTextArea(key, s as HTMLTextAreaElement, codes),
    ),
  ];

  await Promise.all(signings);
}

type ParsedCartUrl = { url: URL; stripped: URL; code: string };

// Parses and validates a URL for signing WITHOUT touching the secret — every
// early-return here (already signed, doesn't match the cart pattern,
// unparsable, no `code` param) must resolve before a key is ever derived, so
// that signUrl/signFragment never require a secret for a URL that doesn't
// need signing at all.
function parseCartUrl(urlStr: string): ParsedCartUrl | null {
  if (isSigned(urlStr)) {
    console.error('Attempt to sign a signed URL', urlStr);
    return null;
  }

  const cartURLpattern = new RegExp(CART_URL, 'i');
  if (!cartURLpattern.test(urlStr)) {
    return null;
  }

  let url;
  let stripped;
  try {
    url = new URL(urlStr);
    stripped = new URL(url.origin);
  } catch (e) {
    return null;
  }

  const code = getCodeFromURL(url);
  if (!code) {
    return null;
  }

  return { url, stripped, code };
}

async function signParsedUrl(key: CryptoKey, parsed: ParsedCartUrl): Promise<string> {
  const { url, stripped, code } = parsed;
  const originalParams = url.searchParams;
  const newParams = stripped.searchParams;

  for (const p of originalParams.entries()) {
    const signed = (
      await signQueryArg(key, decodeURIComponent(p[0]), decodeURIComponent(code), decodeURIComponent(p[1]))
    ).split('=');
    newParams.set(signed[0], signed[1]);
  }

  url.search = newParams.toString();
  return decodeURIComponent(url.toString());
}

/**
 * Signs input name.
 *
 * @param secret Store API key (`webhook_key`) — see the security note above.
 * @param name Name of the input element.
 * @param code Product code.
 * @param parentCode Parent product code.
 * @param value Input value.
 * @returns the signed input name.
 */
export async function signName(
  secret: string,
  name: string,
  code: string,
  parentCode = '',
  value?: string | number,
): Promise<string> {
  const normalizedName = name.replace(/ /g, '_');
  if (shouldSkipInput(normalizedName)) {
    return normalizedName;
  }
  const key = await importSigningKey(secret);
  return signNameWithKey(key, normalizedName, code, parentCode, value);
}

/**
 * Signs input value.
 *
 * @param secret Store API key (`webhook_key`) — see the security note above.
 * @param name Name of the input element.
 * @param code Product code.
 * @param parentCode Parent product code.
 * @param value Input value.
 * @returns the signed value.
 */
export async function signValue(
  secret: string,
  name: string,
  code: string,
  parentCode = '',
  value?: string | number,
): Promise<string> {
  const normalizedName = name.replace(/ /g, '_');
  if (shouldSkipInput(normalizedName)) {
    return value as string;
  }
  const key = await importSigningKey(secret);
  return signValueWithKey(key, normalizedName, code, parentCode, value);
}

/**
 * Signs a query string. All query fields within the query string will be
 * signed, provided it is a proper URL and there is a code field.
 *
 * @param secret Store API key (`webhook_key`) — see the security note above.
 * @param urlStr Full URL including the query string that needs to be signed.
 * @returns the signed query string.
 */
export async function signUrl(secret: string, urlStr: string): Promise<string> {
  const parsed = parseCartUrl(urlStr);
  if (!parsed) {
    return urlStr;
  }
  const key = await importSigningKey(secret);
  return signParsedUrl(key, parsed);
}

/**
 * Signs every cart form and cart link within a DOM tree in place. The tree
 * can be a live `document`/`Element` (browser) or one built with a DOM
 * parser (e.g. jsdom's `new JSDOM(str).window.document` in Node) — this
 * function only needs standard DOM interfaces, not a specific environment.
 *
 * @param secret Store API key (`webhook_key`) — see the security note above.
 * @param root the DOM tree to sign.
 * @returns the same tree, mutated in place.
 */
export async function signFragment(secret: string, root: ParentNode): Promise<ParentNode> {
  const anchors = Array.from(root.querySelectorAll(`a[href*='${CART_URL}']`)) as HTMLAnchorElement[];
  const parsedAnchors: { anchor: HTMLAnchorElement; parsed: ParsedCartUrl }[] = [];
  for (const anchor of anchors) {
    const parsed = parseCartUrl(anchor.href);
    if (parsed) {
      parsedAnchors.push({ anchor, parsed });
    }
  }

  const forms = findCartForms(root);

  // Nothing in this tree needs signing — return without ever deriving a key,
  // matching signUrl's same no-op-means-no-secret-touch behavior.
  if (parsedAnchors.length === 0 && forms.length === 0) {
    return root;
  }

  const key = await importSigningKey(secret);

  for (const { anchor, parsed } of parsedAnchors) {
    anchor.href = await signParsedUrl(key, parsed);
  }

  for (const form of forms) {
    await signForm(key, form);
  }

  return root;
}
