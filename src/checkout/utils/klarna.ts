import type { KlarnaSdkInstance } from "../types";
import { isSettledForeignScript } from "./adoptedScript";

const KLARNA_JS_API_URL = "https://x.klarnacdn.net/kp/lib/v1/api.js";

type KlarnaWindow = Window & {
  Klarna?: KlarnaSdkInstance;
  klarnaAsyncCallback?: () => void;
};

let klarnaSdkLoadPromise: Promise<KlarnaSdkInstance> | null = null;

function getKlarnaWindow(): KlarnaWindow | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window as KlarnaWindow;
}

function getKlarnaNamespace(): KlarnaSdkInstance | undefined {
  return getKlarnaWindow()?.Klarna;
}

function getRequiredKlarnaNamespace(): KlarnaSdkInstance {
  const klarna = getKlarnaNamespace();

  if (!klarna || typeof klarna.Payments?.init !== "function") {
    throw new Error("Klarna SDK is not available.");
  }

  return klarna;
}

function getKlarnaScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${KLARNA_JS_API_URL}"]`);
}

function createKlarnaScriptLoadPromise(
  script: HTMLScriptElement,
): Promise<KlarnaSdkInstance> {
  const existingKlarna = getKlarnaNamespace();

  if (existingKlarna) {
    script.dataset.klarnaSdkState = "loaded";
    return Promise.resolve(existingKlarna);
  }

  if (script.dataset.klarnaSdkState === "error") {
    return Promise.reject(new Error("Failed to load Klarna SDK."));
  }

  if (klarnaSdkLoadPromise) {
    return klarnaSdkLoadPromise;
  }

  const klarnaWindow = getKlarnaWindow();

  if (!klarnaWindow || typeof document === "undefined") {
    return Promise.reject(
      new Error("Klarna SDK can only be loaded in a browser environment."),
    );
  }

  // Guarded on the namespace being absent as well: the other four loaders all
  // return early while one is present, and klarna must match. Once its fast path
  // above requires Payments.init (FX-304), a truthy-but-incomplete window.Klarna
  // reaches here — and that means the script did run, so a finished fetch says
  // nothing about whether klarnaAsyncCallback is still to come.
  if (!existingKlarna && isSettledForeignScript(script, "klarnaSdkState")) {
    return Promise.reject(
      new Error(
        "A Klarna SDK script added outside the Foxy SDK has already failed to load. Remove the duplicate script tag so the SDK can load it.",
      ),
    );
  }

  const previousAsyncCallback = klarnaWindow.klarnaAsyncCallback;

  klarnaSdkLoadPromise = new Promise((resolve, reject) => {
    const cleanup = (): void => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);

      if (klarnaWindow.klarnaAsyncCallback === handleAsyncCallback) {
        if (previousAsyncCallback) {
          klarnaWindow.klarnaAsyncCallback = previousAsyncCallback;
        } else {
          delete klarnaWindow.klarnaAsyncCallback;
        }
      }

      klarnaSdkLoadPromise = null;
    };

    const resolveWithNamespace = (): void => {
      try {
        const klarna = getRequiredKlarnaNamespace();
        script.dataset.klarnaSdkState = "loaded";
        cleanup();
        resolve(klarna);
      } catch (error) {
        handleError(error);
      }
    };

    const handleAsyncCallback = (): void => {
      if (previousAsyncCallback) {
        previousAsyncCallback();
      }

      resolveWithNamespace();
    };

    const handleLoad = (): void => {
      if (getKlarnaNamespace()) {
        resolveWithNamespace();
      }
    };

    const handleError = (cause?: unknown): void => {
      script.dataset.klarnaSdkState = "error";
      cleanup();
      reject(
        cause instanceof Error
          ? cause
          : new Error("Failed to load Klarna SDK."),
      );
    };

    klarnaWindow.klarnaAsyncCallback = handleAsyncCallback;

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });

  return klarnaSdkLoadPromise;
}

export async function loadKlarnaSdk(): Promise<KlarnaSdkInstance> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Klarna SDK can only be loaded in a browser environment.");
  }

  let script = getKlarnaScript();

  if (!script) {
    script = document.createElement("script");
    script.async = true;
    script.dataset.klarnaSdkState = "loading";
    script.src = KLARNA_JS_API_URL;

    (document.head || document.documentElement).appendChild(script);
  }

  return createKlarnaScriptLoadPromise(script);
}

export async function initializeKlarnaSdk(
  clientToken: string,
): Promise<KlarnaSdkInstance> {
  const klarna = await loadKlarnaSdk();

  klarna.Payments.init({ client_token: clientToken });

  return klarna;
}
