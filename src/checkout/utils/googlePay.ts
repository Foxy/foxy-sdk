import type { GooglePaymentsClient } from '../types';
import { isSettledForeignScript } from './adoptedScript';

const GOOGLE_PAY_JS_API_URL = 'https://pay.google.com/gp/p/js/pay.js';

let googlePayScriptLoadPromise: Promise<void> | null = null;

function getGooglePayNamespace():
  | {
      payments?: {
        api?: {
          PaymentsClient?: new (config: Record<string, unknown>) => GooglePaymentsClient;
        };
      };
    }
  | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { google?: unknown }).google as
    | {
        payments?: {
          api?: {
            PaymentsClient?: new (config: Record<string, unknown>) => GooglePaymentsClient;
          };
        };
      }
    | undefined;
}

function getGooglePayScript(): HTMLScriptElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(`script[src="${GOOGLE_PAY_JS_API_URL}"]`);
}

function createGooglePayScriptLoadPromise(script: HTMLScriptElement): Promise<void> {
  if (getGooglePayNamespace()?.payments?.api?.PaymentsClient) {
    script.dataset.googlePaySdkState = 'loaded';
    return Promise.resolve();
  }

  if (script.dataset.googlePaySdkState === 'loaded') {
    return Promise.resolve();
  }

  if (script.dataset.googlePaySdkState === 'error') {
    return Promise.reject(new Error('Failed to load Google Pay JS API.'));
  }

  if (googlePayScriptLoadPromise) {
    return googlePayScriptLoadPromise;
  }

  if (isSettledForeignScript(script, 'googlePaySdkState')) {
    return Promise.reject(
      new Error(
        'A Google Pay JS API script added outside the Foxy SDK has already failed to load. Remove the duplicate script tag so the SDK can load it.',
      ),
    );
  }

  googlePayScriptLoadPromise = new Promise<void>((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      googlePayScriptLoadPromise = null;
    };

    const handleLoad = (): void => {
      script.dataset.googlePaySdkState = 'loaded';
      cleanup();
      resolve();
    };

    const handleError = (): void => {
      script.dataset.googlePaySdkState = 'error';
      cleanup();
      // Dropped from the document so the next call appends a fresh script
      // instead of adopting one whose error event has already fired.
      script.remove();
      reject(new Error('Failed to load Google Pay JS API.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
  });

  return googlePayScriptLoadPromise;
}

export async function loadGooglePaySdk(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (getGooglePayNamespace()?.payments?.api?.PaymentsClient) return;

  let script = getGooglePayScript();

  if (!script) {
    script = document.createElement('script');
    script.async = true;
    script.dataset.googlePaySdkState = 'loading';
    script.src = GOOGLE_PAY_JS_API_URL;

    (document.head || document.documentElement).appendChild(script);
  }

  await createGooglePayScriptLoadPromise(script);
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
