import type { APIEventMap, APIJson } from '../types';

import { API } from '../api';

export type MutableAPIJson = APIJson;

const APPLE_PAY_JS_API_URL = 'https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js';
let applePayScriptLoadPromise: Promise<void> | null = null;

type ApplePayAvailability = 'available' | 'unavailable' | 'non-browser';
type ApplePaySessionLike = { canMakePayments?: () => boolean };
type ApplePayWindow = Window & { ApplePaySession?: ApplePaySessionLike };

type EventName = keyof APIEventMap;
type EventWithDetailName = {
  [K in EventName]: APIEventMap[K] extends CustomEvent<unknown> ? K : never;
}[EventName];

type EventWithoutDetailName = Exclude<EventName, EventWithDetailName>;

type EventDetail<K extends EventName> = APIEventMap[K] extends CustomEvent<infer D> ? D : never;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getApplePayScript(): HTMLScriptElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(`script[src="${APPLE_PAY_JS_API_URL}"]`);
}

function createApplePayScriptLoadPromise(script: HTMLScriptElement): Promise<void> {
  if ((window as ApplePayWindow).ApplePaySession) {
    script.dataset.applePaySdkState = 'loaded';
    return Promise.resolve();
  }

  if (script.dataset.applePaySdkState === 'loaded') {
    return Promise.resolve();
  }

  if (script.dataset.applePaySdkState === 'error') {
    return Promise.reject(new Error('Failed to load Apple Pay JS API.'));
  }

  if (applePayScriptLoadPromise) {
    return applePayScriptLoadPromise;
  }

  applePayScriptLoadPromise = new Promise((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      applePayScriptLoadPromise = null;
    };

    const handleLoad = (): void => {
      script.dataset.applePaySdkState = 'loaded';
      cleanup();
      resolve();
    };

    const handleError = (): void => {
      script.dataset.applePaySdkState = 'error';
      cleanup();
      reject(new Error('Failed to load Apple Pay JS API.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
  });

  return applePayScriptLoadPromise;
}

export function canMakeApplePayPayments(): boolean {
  return getApplePayAvailability() === 'available';
}

export async function ensureApplePayScriptLoaded(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  let script = getApplePayScript();

  if (!script) {
    script = document.createElement('script');
    script.async = true;
    script.dataset.applePaySdkState = 'loading';
    script.src = APPLE_PAY_JS_API_URL;

    (document.head || document.documentElement).appendChild(script);
  }

  try {
    await createApplePayScriptLoadPromise(script);
  } catch {
    return;
  }
}

function getApplePayAvailability(): ApplePayAvailability {
  if (typeof window === 'undefined') {
    return 'non-browser';
  }

  const applePaySession = (window as ApplePayWindow).ApplePaySession;

  if (!applePaySession || typeof applePaySession.canMakePayments !== 'function') {
    return 'unavailable';
  }

  try {
    return applePaySession.canMakePayments() ? 'available' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export function cloneApiJson(json: APIJson): MutableAPIJson {
  return deepClone(json) as MutableAPIJson;
}

async function resolveIncomingApiJson(json: APIJson): Promise<MutableAPIJson> {
  const nextJson = cloneApiJson(json);
  const paymentOptions = nextJson.payment_options;

  const hasApplePay = paymentOptions?.some(option => option.type === 'apple-pay');
  const hasGooglePay = paymentOptions?.some(option => option.type === 'google-pay');

  if (typeof window !== 'undefined') {
    if (hasApplePay && hasGooglePay) {
      await Promise.all([ensureApplePayScriptLoaded(), ensureGooglePayScriptLoaded()]);
    } else if (hasApplePay) {
      await ensureApplePayScriptLoaded();
    } else if (hasGooglePay) {
      await ensureGooglePayScriptLoaded();
    }
  }

  if (!hasApplePay) {
    return nextJson;
  }

  const applePayAvailability = getApplePayAvailability();

  if (applePayAvailability === 'available') {
    return nextJson;
  }

  nextJson.payment_options = paymentOptions!.filter(option => option.type !== 'apple-pay');

  console.warn(
    applePayAvailability === 'non-browser'
      ? 'Apple Pay payment options were removed because checkout API JSON was processed outside a browser environment.'
      : 'Apple Pay payment options were removed because Apple Pay is not available in this browser.'
  );

  return nextJson;
}

const GOOGLE_PAY_JS_API_URL = 'https://pay.google.com/gp/p/js/pay.js';
let googlePayScriptLoadPromise: Promise<void> | null = null;

export type GooglePaymentsClient = {
  isReadyToPay: (request: Record<string, unknown>) => Promise<{ result: boolean }>;
  loadPaymentData: (request: Record<string, unknown>) => Promise<Record<string, unknown>>;
  createButton: (options: Record<string, unknown>) => HTMLElement;
};

type GoogleWindow = Window & {
  google?: {
    payments?: {
      api?: {
        PaymentsClient?: new (config: Record<string, unknown>) => GooglePaymentsClient;
      };
    };
  };
};

function getGooglePayNamespace(): GoogleWindow['google'] {
  if (typeof window === 'undefined') return undefined;
  return (window as GoogleWindow).google;
}

export async function loadGooglePaySdk(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (getGooglePayNamespace()?.payments?.api?.PaymentsClient) return;

  if (!googlePayScriptLoadPromise) {
    googlePayScriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_PAY_JS_API_URL}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Pay JS API.')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_PAY_JS_API_URL;
      script.async = true;
      script.onload = () => {
        googlePayScriptLoadPromise = null;
        resolve();
      };
      script.onerror = () => {
        googlePayScriptLoadPromise = null;
        reject(new Error('Failed to load Google Pay JS API.'));
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  await googlePayScriptLoadPromise;
}

export async function ensureGooglePayScriptLoaded(): Promise<void> {
  try {
    await loadGooglePaySdk();
  } catch {
    return;
  }
}

export async function createGooglePaymentsClient(
  environment: 'TEST' | 'PRODUCTION' = 'TEST'
): Promise<GooglePaymentsClient> {
  await loadGooglePaySdk();

  const PaymentsClient = getGooglePayNamespace()?.payments?.api?.PaymentsClient;
  if (!PaymentsClient) {
    throw new Error('Google Pay SDK is not available.');
  }

  return new PaymentsClient({ environment });
}

export async function canMakeGooglePayPayments(allowedPaymentMethod: Record<string, unknown>): Promise<boolean> {
  try {
    const client = await createGooglePaymentsClient('TEST');
    const readiness = await client.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [allowedPaymentMethod],
    });
    return !!readiness?.result;
  } catch {
    return false;
  }
}

export function toMutable<T>(value: T): T {
  return deepClone(value) as T;
}

export abstract class BaseCheckoutAPI extends API {
  #state: 'idle' | 'busy';
  #json: MutableAPIJson;

  constructor(initialJson: APIJson, initialState: 'idle' | 'busy' = 'idle') {
    super();
    this.#json = cloneApiJson(initialJson);
    this.#state = initialState;
    void this.replaceJson(initialJson);
  }

  get state(): 'idle' | 'busy' {
    return this.#state;
  }

  get json(): APIJson {
    return this.#json as APIJson;
  }

  protected setState(state: 'idle' | 'busy', emitUpdate = true): void {
    this.#state = state;

    if (emitUpdate) {
      this.dispatchEvent(new Event('update'));
    }
  }

  protected mutateJson(mutator: (json: MutableAPIJson) => void): void {
    mutator(this.#json);
    this.dispatchEvent(new Event('update'));
  }

  protected async replaceJson(nextJson: APIJson): Promise<void> {
    const resolvedJson = await resolveIncomingApiJson(nextJson);
    const previousJson = JSON.stringify(this.#json);
    const nextResolvedJson = JSON.stringify(resolvedJson);

    this.#json = resolvedJson;

    if (previousJson !== nextResolvedJson) {
      this.dispatchEvent(new Event('update'));
    }
  }

  protected dispatchCancelable<K extends EventWithoutDetailName>(type: K): boolean;
  protected dispatchCancelable<K extends EventWithDetailName>(type: K, detail: EventDetail<K>): boolean;
  protected dispatchCancelable<K extends EventName>(type: K, detail?: EventDetail<K>): boolean {
    const event =
      detail === undefined
        ? new Event(type, { cancelable: true })
        : new CustomEvent(type, { cancelable: true, detail });

    return this.dispatchEvent(event);
  }

  protected addErrorMessage(message: string, context = 'sdk'): void {
    this.mutateJson(json => {
      json.messages.push({ context, message, level: 'error' });
    });
  }
}
