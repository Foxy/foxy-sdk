import type { SquareSdkInstance, SquareSdkNamespace } from "../types/SquareSdkInstance";

const SQUARE_JS_API_URL = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
} as const;

type SquareWindow = Window & {
  Square?: SquareSdkNamespace;
};

type InitializeSquareSdkParams = {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
};

const squareSdkLoadPromises = new Map<string, Promise<SquareSdkNamespace>>();
const squareInstancePromises = new Map<string, Promise<SquareSdkInstance>>();

function getSquareWindow(): SquareWindow | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window as SquareWindow;
}

function getSquareNamespace(): SquareSdkNamespace | undefined {
  return getSquareWindow()?.Square;
}

function getRequiredSquareNamespace(): SquareSdkNamespace {
  const square = getSquareNamespace();

  if (!square || typeof square.payments !== "function") {
    throw new Error("Square SDK is not available.");
  }

  return square;
}

function getSquareScript(environment: "sandbox" | "production"): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${SQUARE_JS_API_URL[environment]}"]`);
}

function createSquareScriptLoadPromise(
  script: HTMLScriptElement,
  environment: "sandbox" | "production",
): Promise<SquareSdkNamespace> {
  if (script.dataset.squareSdkState === "error") {
    return Promise.reject(new Error("Failed to load Square SDK."));
  }

  const cached = squareSdkLoadPromises.get(environment);
  if (cached) {
    return cached;
  }

  if (!getSquareWindow() || typeof document === "undefined") {
    return Promise.reject(
      new Error("Square SDK can only be loaded in a browser environment."),
    );
  }

  const loadPromise = new Promise<SquareSdkNamespace>((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      squareSdkLoadPromises.delete(environment);
    };

    const handleLoad = (): void => {
      try {
        const square = getRequiredSquareNamespace();
        script.dataset.squareSdkState = "loaded";
        cleanup();
        resolve(square);
      } catch (error) {
        handleError(error);
      }
    };

    const handleError = (cause?: unknown): void => {
      script.dataset.squareSdkState = "error";
      cleanup();
      reject(
        cause instanceof Error
          ? cause
          : new Error("Failed to load Square SDK."),
      );
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });

  squareSdkLoadPromises.set(environment, loadPromise);
  return loadPromise;
}

export async function loadSquareSdk(
  environment: "sandbox" | "production",
): Promise<SquareSdkNamespace> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Square SDK can only be loaded in a browser environment.");
  }

  // A truthy window.Square is not necessarily a usable one: mid-load, or after
  // a partial script failure, it can be present without a callable payments().
  // Validating here keeps the diagnosable "Square SDK is not available." error
  // instead of letting a caller trip over payments() as a bare TypeError.
  if (getSquareNamespace()) {
    return getRequiredSquareNamespace();
  }

  let script = getSquareScript(environment);

  if (!script) {
    script = document.createElement("script");
    script.async = true;
    script.dataset.squareSdkState = "loading";
    script.src = SQUARE_JS_API_URL[environment];

    (document.head || document.documentElement).appendChild(script);
  }

  return createSquareScriptLoadPromise(script, environment);
}

export async function initializeSquareSdk(
  params: InitializeSquareSdkParams,
): Promise<SquareSdkInstance> {
  const cacheKey = `${params.applicationId}:${params.locationId}:${params.environment}`;
  let instancePromise = squareInstancePromises.get(cacheKey);

  if (!instancePromise) {
    instancePromise = loadSquareSdk(params.environment).then((square) =>
      square.payments(params.applicationId, params.locationId),
    );
    squareInstancePromises.set(cacheKey, instancePromise);
  }

  try {
    return await instancePromise;
  } catch (error) {
    squareInstancePromises.delete(cacheKey);
    throw error;
  }
}
