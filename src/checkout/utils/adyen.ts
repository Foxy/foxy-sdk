import type {
  AdyenEmbeddedAmount,
  AdyenEmbeddedCheckoutConfiguration,
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethodsResponse,
  AdyenEmbeddedSdkInstance,
  AdyenEmbeddedSdkNamespace,
} from "../types/AdyenEmbeddedSdkInstance";

const ADYEN_WEB_VERSION = "6.36.0";

type AdyenWindow = Window & {
  AdyenWeb?: AdyenEmbeddedSdkNamespace;
};

type InitializeAdyenEmbeddedSdkParams = {
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  environment: AdyenEmbeddedEnvironment;
  clientKey: string;
  amount?: AdyenEmbeddedAmount;
  locale?: string;
  countryCode?: string;
};

const adyenSdkLoadPromises = new Map<
  string,
  Promise<AdyenEmbeddedSdkNamespace>
>();

const adyenCheckoutInstancePromises = new Map<
  string,
  Promise<AdyenEmbeddedSdkInstance>
>();

function getTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : undefined;
}

function getNormalizedCountryCode(value: unknown): string | undefined {
  const normalizedValue = getTrimmedString(value);

  return normalizedValue ? normalizedValue.toUpperCase() : undefined;
}

function getNormalizedCurrencyCode(value: unknown): string | undefined {
  const normalizedValue = getTrimmedString(value);

  return normalizedValue ? normalizedValue.toUpperCase() : undefined;
}

function getNormalizedLocale(value: unknown): string | undefined {
  const trimmed = getTrimmedString(value);
  return trimmed?.replace(/_/g, "-");
}

function getAdyenWindow(): AdyenWindow | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window as AdyenWindow;
}

function getAdyenNamespace(): AdyenEmbeddedSdkNamespace | undefined {
  return getAdyenWindow()?.AdyenWeb;
}

function getRequiredAdyenNamespace(): AdyenEmbeddedSdkNamespace {
  const adyen = getAdyenNamespace();

  if (!adyen || typeof adyen.AdyenCheckout !== "function") {
    throw new Error("Adyen SDK is not available.");
  }

  return adyen;
}

function getAdyenAssetBaseUrl(environment: AdyenEmbeddedEnvironment): string {
  return `https://checkoutshopper-${environment}.cdn.adyen.com/checkoutshopper/sdk/${ADYEN_WEB_VERSION}`;
}

function getAdyenScriptUrl(environment: AdyenEmbeddedEnvironment): string {
  return `${getAdyenAssetBaseUrl(environment)}/adyen.js`;
}

function getAdyenScript(
  environment: AdyenEmbeddedEnvironment,
): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(
    `script[src="${getAdyenScriptUrl(environment)}"]`,
  );
}

function createAdyenScriptLoadPromise(
  script: HTMLScriptElement,
): Promise<AdyenEmbeddedSdkNamespace> {
  const existingNamespace = getAdyenNamespace();

  if (existingNamespace) {
    script.dataset.adyenSdkState = "loaded";
    return Promise.resolve(existingNamespace);
  }

  if (script.dataset.adyenSdkState === "loaded") {
    return Promise.resolve(getRequiredAdyenNamespace());
  }

  if (script.dataset.adyenSdkState === "error") {
    return Promise.reject(new Error("Failed to load Adyen SDK."));
  }

  const existingPromise = adyenSdkLoadPromises.get(script.src);

  if (existingPromise) {
    return existingPromise;
  }

  if (!getAdyenWindow() || typeof document === "undefined") {
    return Promise.reject(
      new Error("Adyen SDK can only be loaded in a browser environment."),
    );
  }

  const promise = new Promise<AdyenEmbeddedSdkNamespace>((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const handleLoad = (): void => {
      try {
        const adyen = getRequiredAdyenNamespace();
        script.dataset.adyenSdkState = "loaded";
        cleanup();
        resolve(adyen);
      } catch (error) {
        handleError(error);
      }
    };

    const handleError = (cause?: unknown): void => {
      script.dataset.adyenSdkState = "error";
      cleanup();
      reject(
        cause instanceof Error ? cause : new Error("Failed to load Adyen SDK."),
      );
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });

  adyenSdkLoadPromises.set(script.src, promise);
  promise.catch(() => {
    if (adyenSdkLoadPromises.get(script.src) === promise) {
      adyenSdkLoadPromises.delete(script.src);
    }
  });

  return promise;
}

export async function loadAdyenSdk(
  environment: AdyenEmbeddedEnvironment,
): Promise<AdyenEmbeddedSdkNamespace> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Adyen SDK can only be loaded in a browser environment.");
  }

  const existingNamespace = getAdyenNamespace();

  if (existingNamespace) {
    return existingNamespace;
  }

  let script = getAdyenScript(environment);

  if (!script) {
    script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.adyenSdkState = "loading";
    script.src = getAdyenScriptUrl(environment);

    (document.head || document.documentElement).appendChild(script);
  }

  return createAdyenScriptLoadPromise(script);
}

function getAdyenCheckoutConfiguration(
  params: InitializeAdyenEmbeddedSdkParams,
): AdyenEmbeddedCheckoutConfiguration {
  const clientKey = getTrimmedString(params.clientKey);
  const locale = getNormalizedLocale(params.locale);
  const countryCode = getNormalizedCountryCode(params.countryCode);
  const currency = getNormalizedCurrencyCode(params.amount?.currency);
  const amountValue = params.amount?.value;

  if (!clientKey) {
    throw new Error("Adyen client key is required.");
  }

  if (!countryCode) {
    throw new Error("Adyen country code is required.");
  }

  if (
    amountValue === undefined ||
    !Number.isSafeInteger(amountValue) ||
    amountValue < 0 ||
    !currency
  ) {
    throw new Error("Adyen amount is required.");
  }

  const configuration: AdyenEmbeddedCheckoutConfiguration = {
    paymentMethodsResponse: params.paymentMethodsResponse,
    environment: params.environment,
    amount: { value: amountValue, currency },
    countryCode,
    clientKey,
  };

  if (locale) {
    configuration.locale = locale;
  }

  return configuration;
}

function getAdyenCheckoutKey(
  configuration: AdyenEmbeddedCheckoutConfiguration,
): string {
  return [
    configuration.environment,
    configuration.clientKey,
    configuration.amount.currency,
    String(configuration.amount.value),
    configuration.countryCode,
    configuration.locale ?? "",
  ].join(":");
}

async function createAdyenCheckout(
  configuration: AdyenEmbeddedCheckoutConfiguration,
): Promise<AdyenEmbeddedSdkInstance> {
  const cacheKey = getAdyenCheckoutKey(configuration);
  let instancePromise = adyenCheckoutInstancePromises.get(cacheKey);

  if (!instancePromise) {
    instancePromise = loadAdyenSdk(configuration.environment).then(
      ({ AdyenCheckout }) => AdyenCheckout(configuration),
    );
    adyenCheckoutInstancePromises.set(cacheKey, instancePromise);
  }

  try {
    return await instancePromise;
  } catch (error) {
    adyenCheckoutInstancePromises.delete(cacheKey);
    throw error;
  }
}

export async function initializeAdyenEmbeddedSdk(
  params: InitializeAdyenEmbeddedSdkParams,
): Promise<AdyenEmbeddedSdkInstance> {
  const configuration = getAdyenCheckoutConfiguration(params);
  return await createAdyenCheckout(configuration);
}
