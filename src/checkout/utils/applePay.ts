const APPLE_PAY_JS_API_URL = 'https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js';

let applePayScriptLoadPromise: Promise<void> | null = null;

function getApplePayScript(): HTMLScriptElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(`script[src="${APPLE_PAY_JS_API_URL}"]`);
}

function createApplePayScriptLoadPromise(script: HTMLScriptElement): Promise<void> {
  const applePaySession = (window as Window & { ApplePaySession?: { canMakePayments?: () => boolean } })
    .ApplePaySession;

  if (applePaySession) {
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

export function getApplePayAvailability(): 'available' | 'unavailable' | 'non-browser' {
  if (typeof window === 'undefined') {
    return 'non-browser';
  }

  const applePaySession = (window as Window & { ApplePaySession?: { canMakePayments?: () => boolean } })
    .ApplePaySession;

  if (!applePaySession || typeof applePaySession.canMakePayments !== 'function') {
    return 'unavailable';
  }

  try {
    return applePaySession.canMakePayments() ? 'available' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export async function loadApplePaySdk(): Promise<void> {
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

  await createApplePayScriptLoadPromise(script);
}
