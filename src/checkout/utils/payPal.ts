import type { CustomConfig } from "../types";
import type { PayPalSdkInstance } from "../types/PayPalSdkInstance";
import type {
  FindEligibleMethodsOptions,
  GooglePayConfigFromFindEligibleMethods,
  PayPalV6Namespace,
} from "@paypal/paypal-js/sdk-v6";

function asConfigObject(
  c: CustomConfig | undefined,
): Record<string, CustomConfig> | undefined {
  if (typeof c === "object" && c !== null && !Array.isArray(c)) {
    return c as Record<string, CustomConfig>;
  }
  return undefined;
}

type PayPalEnvironment = "production" | "sandbox";

type DiscoverPayPalPaymentOptionsParams = {
  clientId: string;
  clientToken?: string;
  customConfig?: CustomConfig;
  amount?: string;
  currencyCode?: string;
  locale?: string;
  buyerCountry?: string;
};

type DiscoverPayPalPaymentOptionsResult = {
  paypal: PayPalSdkInstance | null;
  options: PayPalDiscoveredPaymentOption[];
};

type PayPalDiscoveredPaymentOption =
  | {
      type: "new-card";
      gateway: "paypal_platform";
      client_id: string;
    }
  | {
      type: "apple-pay";
      gateway: "paypal_platform";
      client_id: string;
    }
  | {
      type: "google-pay";
      gateway: "paypal_platform";
      client_id: string;
      merchant_id: string;
      gateway_parameters?: Record<string, string>;
    }
  | {
      type:
        | "paypal-pay-later"
        | "paypal-credit"
        | "venmo"
        | "bancontact"
        | "ideal"
        | "eps"
        | "blik"
        | "przelewy24";
      gateway: "paypal_platform";
      client_id: string;
    };

type PayPalSdkComponentProfile = "base" | "extended";

type UndocumentedPayPalFundingSource =
  | "bancontact"
  | "ideal"
  | "eps"
  | "blik"
  | "p24";

type UndocumentedPayPalSessionCreator =
  | "createBancontactOneTimePaymentSession"
  | "createIdealOneTimePaymentSession"
  | "createEpsOneTimePaymentSession"
  | "createBlikOneTimePaymentSession"
  | "createP24OneTimePaymentSession";

type PayPalAlternativePaymentMethodDescriptor = {
  eligibilityKey: UndocumentedPayPalFundingSource;
  optionType: Extract<
    PayPalDiscoveredPaymentOption["type"],
    "bancontact" | "ideal" | "eps" | "blik" | "przelewy24"
  >;
  sessionCreator: UndocumentedPayPalSessionCreator;
};

type PayPalEligibility = Awaited<
  ReturnType<PayPalSdkInstance["findEligibleMethods"]>
>;

type PayPalSdkCreateInstanceOptions = (
  | { clientId: string; clientToken?: never }
  | { clientToken: string; clientId?: never }
) & {
  components: readonly string[];
  locale?: string;
  pageType: "checkout";
  testBuyerCountry?: string;
};

class PayPalSdkTimeoutError extends Error {}

const PAYPAL_SDK_BASE_COMPONENTS = [
  "paypal-payments",
  "card-fields",
  "venmo-payments",
  "applepay-payments",
  "googlepay-payments",
] as const;

const PAYPAL_SDK_UNDOCUMENTED_APM_COMPONENTS = [
  "bancontact-payments",
  "ideal-payments",
  "eps-payments",
  "blik-payments",
  "p24-payments",
] as const;

const PAYPAL_SDK_COMPONENTS: Record<
  PayPalSdkComponentProfile,
  readonly string[]
> = {
  base: PAYPAL_SDK_BASE_COMPONENTS,
  extended: [
    ...PAYPAL_SDK_BASE_COMPONENTS,
    ...PAYPAL_SDK_UNDOCUMENTED_APM_COMPONENTS,
  ],
};

const PAYPAL_UNDOCUMENTED_APMS: readonly PayPalAlternativePaymentMethodDescriptor[] =
  [
    {
      eligibilityKey: "bancontact",
      optionType: "bancontact",
      sessionCreator: "createBancontactOneTimePaymentSession",
    },
    {
      eligibilityKey: "ideal",
      optionType: "ideal",
      sessionCreator: "createIdealOneTimePaymentSession",
    },
    {
      eligibilityKey: "eps",
      optionType: "eps",
      sessionCreator: "createEpsOneTimePaymentSession",
    },
    {
      eligibilityKey: "blik",
      optionType: "blik",
      sessionCreator: "createBlikOneTimePaymentSession",
    },
    {
      eligibilityKey: "p24",
      optionType: "przelewy24",
      sessionCreator: "createP24OneTimePaymentSession",
    },
  ] as const;

const PAYPAL_SDK_ENVIRONMENTS: PayPalEnvironment[] = ["sandbox", "production"];

const PAYPAL_SDK_NAMESPACE: Record<PayPalEnvironment, string> = {
  sandbox: "foxyPaypalSandbox",
  production: "foxyPaypalProduction",
};

const PAYPAL_SDK_INSTANCE_TIMEOUT_MS = 500;

let payPalSdkModulePromise: Promise<
  typeof import("@paypal/paypal-js/sdk-v6")
> | null = null;

const payPalNamespacePromises = new Map<
  PayPalEnvironment,
  Promise<PayPalV6Namespace>
>();

const payPalInstancePromises = new Map<string, Promise<PayPalSdkInstance>>();

function getPayPalSdkModule(): Promise<
  typeof import("@paypal/paypal-js/sdk-v6")
> {
  if (!payPalSdkModulePromise) {
    payPalSdkModulePromise = import("@paypal/paypal-js/sdk-v6");
  }

  return payPalSdkModulePromise;
}

function isPayPalEnvironment(value: unknown): value is PayPalEnvironment {
  return value === "production" || value === "sandbox";
}

function normalizeCountry(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toUpperCase();

  return normalizedValue ? normalizedValue : undefined;
}

function getPayPalEnvironment(
  config?: CustomConfig,
): PayPalEnvironment | undefined {
  const configObj = asConfigObject(config);
  const directEnvironment = configObj?.paypal_environment;

  if (isPayPalEnvironment(directEnvironment)) {
    return directEnvironment;
  }

  const camelEnvironment = configObj?.paypalEnvironment;

  if (isPayPalEnvironment(camelEnvironment)) {
    return camelEnvironment;
  }

  const nestedPayPal = configObj?.paypal;

  if (typeof nestedPayPal === "object" && nestedPayPal !== null) {
    const nestedEnvironment = (nestedPayPal as { environment?: unknown })
      .environment;

    if (isPayPalEnvironment(nestedEnvironment)) {
      return nestedEnvironment;
    }
  }

  return undefined;
}

function getPayPalTestBuyerCountry(
  config?: CustomConfig,
  buyerCountry?: string,
): string | undefined {
  const configObj2 = asConfigObject(config);
  const directCountry = normalizeCountry(configObj2?.paypal_test_buyer_country);

  if (directCountry) {
    return directCountry;
  }

  const camelCountry = normalizeCountry(configObj2?.paypalTestBuyerCountry);

  if (camelCountry) {
    return camelCountry;
  }

  const nestedPayPal = configObj2?.paypal;

  if (typeof nestedPayPal === "object" && nestedPayPal !== null) {
    const nestedCountry = normalizeCountry(
      (nestedPayPal as { testBuyerCountry?: unknown }).testBuyerCountry,
    );

    if (nestedCountry) {
      return nestedCountry;
    }
  }

  return normalizeCountry(buyerCountry);
}

function getPayPalInstanceKey(
  environment: PayPalEnvironment,
  clientId: string,
  componentProfile: PayPalSdkComponentProfile,
  testBuyerCountry?: string,
): string {
  return `${environment}:${clientId}:${componentProfile}:${testBuyerCountry ?? ""}`;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => Error,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(onTimeout());
    }, timeoutMs);

    void promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function toGooglePayGatewayParameters(
  config: GooglePayConfigFromFindEligibleMethods,
): Record<string, string> | undefined {
  const parameters =
    config.allowedPaymentMethods[0]?.tokenizationSpecification.parameters;

  if (!parameters) {
    return undefined;
  }

  const gatewayParameters = Object.entries(parameters).reduce<
    Record<string, string>
  >((result, [key, value]) => {
    if (typeof value === "string") {
      result[key] = value;
    }

    return result;
  }, {});

  return Object.keys(gatewayParameters).length > 0
    ? gatewayParameters
    : undefined;
}

function buildFindEligibleMethodsOptions(
  params: DiscoverPayPalPaymentOptionsParams,
): FindEligibleMethodsOptions {
  const options: FindEligibleMethodsOptions = {
    paymentFlow: "ONE_TIME_PAYMENT",
  };

  if (params.amount) {
    options.amount = params.amount;
  }

  if (params.currencyCode) {
    options.currencyCode = params.currencyCode;
  }

  return options;
}

function hasPayPalSessionCreator(
  paypal: PayPalSdkInstance,
  methodName: string,
): boolean {
  return (
    typeof (paypal as unknown as Record<string, unknown>)[methodName] ===
    "function"
  );
}

function isPayPalMethodEligible(
  eligibility: PayPalEligibility,
  fundingSource: string,
): boolean {
  return (eligibility.isEligible as (fundingSource: string) => boolean)(
    fundingSource,
  );
}

async function loadPayPalNamespace(
  environment: PayPalEnvironment,
): Promise<PayPalV6Namespace> {
  let promise = payPalNamespacePromises.get(environment);

  if (!promise) {
    promise = (async () => {
      const { loadCoreSdkScript } = await getPayPalSdkModule();
      const paypal = await loadCoreSdkScript({
        environment,
        dataNamespace: PAYPAL_SDK_NAMESPACE[environment],
        dataSdkIntegrationSource: "foxy-sdk",
      });

      if (!paypal) {
        throw new Error("PayPal SDK is not available.");
      }

      return paypal;
    })();

    payPalNamespacePromises.set(environment, promise);
    promise.catch(() => {
      if (payPalNamespacePromises.get(environment) === promise) {
        payPalNamespacePromises.delete(environment);
      }
    });
  }

  return promise;
}

async function createPayPalInstance(
  clientId: string,
  environment: PayPalEnvironment,
  componentProfile: PayPalSdkComponentProfile,
  locale?: string,
  testBuyerCountry?: string,
  clientToken?: string,
): Promise<PayPalSdkInstance> {
  const normalizedLocale = locale?.replace(/_/g, "-");
  const key = getPayPalInstanceKey(
    environment,
    clientId,
    componentProfile,
    testBuyerCountry,
  );
  let promise = payPalInstancePromises.get(key);

  if (!promise) {
    promise = (async () => {
      const namespace = await loadPayPalNamespace(environment);
      const createInstance = namespace.createInstance as unknown as (
        options: PayPalSdkCreateInstanceOptions,
      ) => Promise<PayPalSdkInstance>;

      return await withTimeout(
        createInstance({
          ...(clientToken ? { clientToken } : { clientId }),
          components: PAYPAL_SDK_COMPONENTS[componentProfile],
          locale: normalizedLocale,
          pageType: "checkout",
          testBuyerCountry:
            environment === "sandbox" ? testBuyerCountry : undefined,
        }),
        PAYPAL_SDK_INSTANCE_TIMEOUT_MS,
        () =>
          new PayPalSdkTimeoutError(
            `PayPal SDK ${componentProfile} instance initialization timed out.`,
          ),
      );
    })();

    payPalInstancePromises.set(key, promise);
    promise.catch(() => {
      if (payPalInstancePromises.get(key) === promise) {
        payPalInstancePromises.delete(key);
      }
    });
  }

  const paypal = await promise;

  if (normalizedLocale) {
    paypal.updateLocale(normalizedLocale);
  }

  return paypal;
}

export async function loadPayPalSdk(
  params: DiscoverPayPalPaymentOptionsParams,
): Promise<PayPalSdkInstance> {
  const preferredEnvironment = getPayPalEnvironment(params.customConfig);
  const testBuyerCountry = getPayPalTestBuyerCountry(
    params.customConfig,
    params.buyerCountry,
  );
  const environments = preferredEnvironment
    ? [preferredEnvironment]
    : PAYPAL_SDK_ENVIRONMENTS;

  let lastError: unknown;

  for (const environment of environments) {
    try {
      return await createPayPalInstance(
        params.clientId,
        environment,
        "extended",
        params.locale,
        testBuyerCountry,
        params.clientToken,
      );
    } catch (error) {
      lastError = error;

      if (error instanceof PayPalSdkTimeoutError) {
        continue;
      }

      try {
        return await createPayPalInstance(
          params.clientId,
          environment,
          "base",
          params.locale,
          testBuyerCountry,
          params.clientToken,
        );
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("PayPal SDK is not available.");
}

export async function discoverPayPalPaymentOptions(
  params: DiscoverPayPalPaymentOptionsParams,
): Promise<DiscoverPayPalPaymentOptionsResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { paypal: null, options: [] };
  }

  try {
    const paypal = await loadPayPalSdk(params);
    const eligibility = await paypal.findEligibleMethods(
      buildFindEligibleMethodsOptions(params),
    );

    const options: PayPalDiscoveredPaymentOption[] = [];

    if (
      isPayPalMethodEligible(eligibility, "advanced_cards") &&
      hasPayPalSessionCreator(paypal, "createCardFieldsOneTimePaymentSession")
    ) {
      options.push({
        type: "new-card",
        gateway: "paypal_platform",
        client_id: params.clientId,
      });
    }

    if (
      isPayPalMethodEligible(eligibility, "applepay") &&
      hasPayPalSessionCreator(paypal, "createApplePayOneTimePaymentSession")
    ) {
      options.push({
        type: "apple-pay",
        gateway: "paypal_platform",
        client_id: params.clientId,
      });
    }

    if (
      isPayPalMethodEligible(eligibility, "googlepay") &&
      hasPayPalSessionCreator(paypal, "createGooglePayOneTimePaymentSession")
    ) {
      const details = eligibility.getDetails("googlepay");

      options.push({
        type: "google-pay",
        gateway: "paypal_platform",
        client_id: params.clientId,
        merchant_id: details.config.merchantInfo.merchantId,
        gateway_parameters: toGooglePayGatewayParameters(details.config),
      });
    }

    if (
      isPayPalMethodEligible(eligibility, "paylater") &&
      hasPayPalSessionCreator(paypal, "createPayLaterOneTimePaymentSession")
    ) {
      options.push({
        type: "paypal-pay-later",
        gateway: "paypal_platform",
        client_id: params.clientId,
      });
    }

    if (
      isPayPalMethodEligible(eligibility, "credit") &&
      hasPayPalSessionCreator(paypal, "createPayPalCreditOneTimePaymentSession")
    ) {
      options.push({
        type: "paypal-credit",
        gateway: "paypal_platform",
        client_id: params.clientId,
      });
    }

    if (
      isPayPalMethodEligible(eligibility, "venmo") &&
      hasPayPalSessionCreator(paypal, "createVenmoOneTimePaymentSession")
    ) {
      options.push({
        type: "venmo",
        gateway: "paypal_platform",
        client_id: params.clientId,
      });
    }

    for (const apm of PAYPAL_UNDOCUMENTED_APMS) {
      if (
        isPayPalMethodEligible(eligibility, apm.eligibilityKey) &&
        hasPayPalSessionCreator(paypal, apm.sessionCreator)
      ) {
        options.push({
          type: apm.optionType,
          gateway: "paypal_platform",
          client_id: params.clientId,
        });
      }
    }

    return { paypal, options };
  } catch {
    return { paypal: null, options: [] };
  }
}
