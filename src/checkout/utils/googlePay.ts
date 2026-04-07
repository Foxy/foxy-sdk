import type { GooglePaymentsClient } from '../types';

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
