import type { CustomConfig } from "../types";
import type {
  SezzleCheckoutApiMode,
  SezzleCheckoutApiVersion,
  SezzleCheckoutConfiguration,
  SezzleCheckoutMode,
  SezzleSdkConstructor,
  SezzleSdkInstance,
} from "../types/SezzleSdkInstance";

function asConfigObject(
  c: CustomConfig | undefined,
): Record<string, CustomConfig> | undefined {
  if (typeof c === "object" && c !== null && !Array.isArray(c)) {
    return c as Record<string, CustomConfig>;
  }
  return undefined;
}

const SEZZLE_JS_API_URL = "https://checkout-sdk.sezzle.com/checkout.min.js";

type SezzleWindow = Window & {
  Checkout?: SezzleSdkConstructor;
};

type InitializeSezzleSdkParams = {
  publicKey: string;
  customConfig?: CustomConfig;
};

let sezzleSdkLoadPromise: Promise<SezzleSdkConstructor> | null = null;

const sezzleInstancePromises = new Map<string, Promise<SezzleSdkInstance>>();

function getSezzleWindow(): SezzleWindow | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window as SezzleWindow;
}

function getSezzleConstructor(): SezzleSdkConstructor | undefined {
  return getSezzleWindow()?.Checkout;
}

function getRequiredSezzleConstructor(): SezzleSdkConstructor {
  const checkout = getSezzleConstructor();

  if (!checkout) {
    throw new Error("Sezzle SDK is not available.");
  }

  return checkout;
}

function getSezzleScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${SEZZLE_JS_API_URL}"]`);
}

function isSezzleApiMode(value: unknown): value is SezzleCheckoutApiMode {
  return value === "live" || value === "sandbox";
}

function isSezzleApiVersion(value: unknown): value is SezzleCheckoutApiVersion {
  return value === "v2";
}

function isSezzleCheckoutMode(value: unknown): value is SezzleCheckoutMode {
  return value === "popup" || value === "iframe" || value === "redirect";
}

function getNestedSezzleConfig(
  config?: CustomConfig,
): Record<string, unknown> | undefined {
  const nestedConfig = asConfigObject(config)?.sezzle;

  if (typeof nestedConfig !== "object" || nestedConfig === null) {
    return undefined;
  }

  return nestedConfig as Record<string, unknown>;
}

function getSezzleApiMode(
  config?: CustomConfig,
): SezzleCheckoutApiMode | undefined {
  const nestedConfig = getNestedSezzleConfig(config);
  const configObj = asConfigObject(config);
  const candidates = [
    configObj?.sezzle_api_mode,
    configObj?.sezzleApiMode,
    nestedConfig?.api_mode,
    nestedConfig?.apiMode,
  ];

  return candidates.find(isSezzleApiMode);
}

function getSezzleApiVersion(
  config?: CustomConfig,
): SezzleCheckoutApiVersion | undefined {
  const nestedConfig = getNestedSezzleConfig(config);
  const configObj = asConfigObject(config);
  const candidates = [
    configObj?.sezzle_api_version,
    configObj?.sezzleApiVersion,
    nestedConfig?.api_version,
    nestedConfig?.apiVersion,
  ];

  return candidates.find(isSezzleApiVersion);
}

function getSezzleMode(config?: CustomConfig): SezzleCheckoutMode | undefined {
  const nestedConfig = getNestedSezzleConfig(config);
  const configObj = asConfigObject(config);
  const candidates = [
    configObj?.sezzle_mode,
    configObj?.sezzleMode,
    nestedConfig?.mode,
  ];

  return candidates.find(isSezzleCheckoutMode);
}

function getSezzleConfiguration(
  params: InitializeSezzleSdkParams,
): SezzleCheckoutConfiguration {
  const configuration: SezzleCheckoutConfiguration = {
    publicKey: params.publicKey,
  };
  const apiMode = getSezzleApiMode(params.customConfig);
  const apiVersion = getSezzleApiVersion(params.customConfig);
  const mode = getSezzleMode(params.customConfig);

  if (apiMode) {
    configuration.apiMode = apiMode;
  }

  if (apiVersion) {
    configuration.apiVersion = apiVersion;
  }

  if (mode) {
    configuration.mode = mode;
  }

  return configuration;
}

function getSezzleInstanceKey(
  configuration: SezzleCheckoutConfiguration,
): string {
  return [
    configuration.publicKey,
    configuration.apiMode ?? "",
    configuration.apiVersion ?? "",
    configuration.mode ?? "",
  ].join(":");
}

function createSezzleScriptLoadPromise(
  script: HTMLScriptElement,
): Promise<SezzleSdkConstructor> {
  const existingConstructor = getSezzleConstructor();

  if (existingConstructor) {
    script.dataset.sezzleSdkState = "loaded";
    return Promise.resolve(existingConstructor);
  }

  if (script.dataset.sezzleSdkState === "error") {
    return Promise.reject(new Error("Failed to load Sezzle SDK."));
  }

  if (sezzleSdkLoadPromise) {
    return sezzleSdkLoadPromise;
  }

  if (!getSezzleWindow() || typeof document === "undefined") {
    return Promise.reject(
      new Error("Sezzle SDK can only be loaded in a browser environment."),
    );
  }

  sezzleSdkLoadPromise = new Promise((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      sezzleSdkLoadPromise = null;
    };

    const handleLoad = (): void => {
      try {
        const checkout = getRequiredSezzleConstructor();
        script.dataset.sezzleSdkState = "loaded";
        cleanup();
        resolve(checkout);
      } catch (error) {
        handleError(error);
      }
    };

    const handleError = (cause?: unknown): void => {
      script.dataset.sezzleSdkState = "error";
      cleanup();
      reject(
        cause instanceof Error
          ? cause
          : new Error("Failed to load Sezzle SDK."),
      );
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });

  return sezzleSdkLoadPromise;
}

export async function loadSezzleSdk(): Promise<SezzleSdkConstructor> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Sezzle SDK can only be loaded in a browser environment.");
  }

  const existingConstructor = getSezzleConstructor();

  if (existingConstructor) {
    return existingConstructor;
  }

  let script = getSezzleScript();

  if (!script) {
    script = document.createElement("script");
    script.async = true;
    script.dataset.sezzleSdkState = "loading";
    script.src = SEZZLE_JS_API_URL;

    (document.head || document.documentElement).appendChild(script);
  }

  return createSezzleScriptLoadPromise(script);
}

export async function initializeSezzleSdk(
  params: InitializeSezzleSdkParams,
): Promise<SezzleSdkInstance> {
  const configuration = getSezzleConfiguration(params);
  const cacheKey = getSezzleInstanceKey(configuration);
  let instancePromise = sezzleInstancePromises.get(cacheKey);

  if (!instancePromise) {
    instancePromise = loadSezzleSdk().then(
      (Checkout) => new Checkout(configuration),
    );
    sezzleInstancePromises.set(cacheKey, instancePromise);
  }

  try {
    return await instancePromise;
  } catch (error) {
    sezzleInstancePromises.delete(cacheKey);
    throw error;
  }
}
