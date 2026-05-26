import type {
  AdyenEmbeddedAmount,
  AdyenEmbeddedCheckoutConfiguration,
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethod,
  AdyenEmbeddedSdkInstance,
  AdyenEmbeddedSdkNamespace,
} from "../types/AdyenEmbeddedSdkInstance";
import type {
  AdyenEmbeddedAlternativePaymentMethodType,
  AdyenEmbeddedAlternativePaymentOptionType,
  PaymentOption,
} from "../types/PaymentOption";

const ADYEN_WEB_VERSION = "6.36.0";

const ADYEN_EMBEDDED_CARD_PAYMENT_METHOD_TYPES = ["card", "scheme"] as const;

const ADYEN_EMBEDDED_SHARED_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE = {
  bcmc: "bancontact",
  sepadirectdebit: "sepa",
  applepay: "apple-pay",
  googlepay: "google-pay",
  paywithgoogle: "google-pay",
  eps: "eps",
  blik: "blik",
} as const;

const ADYEN_EMBEDDED_DISTINCT_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE = {
  bankTransfer_IBAN: "bank-transfer",
  bankTransfer_BE: "bank-transfer",
  bankTransfer_NL: "bank-transfer",
  bankTransfer_PL: "bank-transfer",
  bankTransfer_FR: "bank-transfer",
  bankTransfer_CH: "bank-transfer",
  bankTransfer_IE: "bank-transfer",
  bankTransfer_GB: "bank-transfer",
  bankTransfer_DE: "bank-transfer",
  ach: "ach",
  directdebit_GB: "bacs-direct-debit",
  eft_directdebit_CA: "eft",
  affirm: "affirm",
  afterpay: "afterpay",
  afterpay_default: "afterpay",
  afterpay_b2b: "afterpay",
  atome: "atome",
  facilypay_3x: "facilypay",
  facilypay_4x: "facilypay",
  facilypay_6x: "facilypay",
  facilypay_10x: "facilypay",
  facilypay_12x: "facilypay",
  amazonpay: "amazon-pay",
  cashapp: "cash-app",
  clicktopay: "click-to-pay",
  boletobancario: "boleto-bancario",
  boletobancario_itau: "boleto-bancario",
  boletobancario_santander: "boleto-bancario",
  primeiropay_boleto: "boleto-bancario",
  doku: "doku",
  doku_alfamart: "doku",
  doku_permata_lite_atm: "doku",
  doku_indomaret: "doku",
  doku_atm_mandiri_va: "doku",
  doku_sinarmas_va: "doku",
  doku_mandiri_va: "doku",
  doku_cimb_va: "doku",
  doku_danamon_va: "doku",
  doku_bri_va: "doku",
  doku_bni_va: "doku",
  doku_bca_va: "doku",
  doku_wallet: "doku",
  oxxo: "oxxo",
  billdesk_online: "billdesk",
  billdesk_wallet: "billdesk",
  dotpay: "dotpay",
  iris: "iris",
  molpay_ebanking_fpx_MY: "molpay",
  molpay_ebanking_TH: "molpay",
  molpay_ebanking_VN: "molpay",
  onlineBanking_CZ: "online-banking",
  onlinebanking_IN: "online-banking",
  onlineBanking_PL: "online-banking",
  onlineBanking_SK: "online-banking",
  paybybank: "pay-by-bank",
  payu_IN_cashcard: "payu",
  payu_IN_nb: "payu",
  wallet_IN: "wallet",
  dragonpay_ebanking: "dragonpay",
  dragonpay_otc_banking: "dragonpay",
  dragonpay_otc_non_banking: "dragonpay",
  dragonpay_otc_philippines: "dragonpay",
  econtext_atm: "econtext",
  econtext_online: "econtext",
  econtext_seven_eleven: "econtext",
  econtext_stores: "econtext",
  giropay: "giropay",
  multibanco: "multibanco",
  redirect: "redirect",
  twint: "twint",
  vipps: "vipps",
  trustly: "trustly",
  paybybank_AIS_DD: "pay-by-bank",
  riverty: "riverty",
  paybybank_pix: "pay-by-bank",
  bcmc_mobile: "bancontact",
  bcmc_mobile_QR: "bancontact",
  pix: "pix",
  swish: "swish",
  wechatpay: "we-chat",
  wechatpayQR: "we-chat",
  promptpay: "prompt-pay",
  paynow: "pay-now",
  duitnow: "duit-now",
  mbway: "mbway",
  ancv: "ancv",
  payto: "pay-to",
  upi: "upi",
  upi_qr: "upi",
  upi_intent: "upi",
  alipay: "alipay",
  alipay_plus: "alipay-plus",
  alipay_hk: "alipay-hk",
  alma: "alma",
  bizum: "bizum",
  molpay_boost: "boost",
  dana: "dana",
  ebanking_FI: "online-banking",
  gcash: "gcash",
  gopay_wallet: "gopay",
  grabpay_SG: "grabpay",
  grabpay_MY: "grabpay",
  grabpay_PH: "grabpay",
  kakaopay: "kakaopay",
  mobilepay: "mobilepay",
  momo_wallet: "momo-wallet",
  kcp_naverpay: "naverpay",
  paybright: "paybright",
  kcp_payco: "payco",
  payme: "payme",
  paypo: "paypo",
  paysafecard: "paysafecard",
  paypay: "paypay",
  rakutenpay: "rakutenpay",
  scalapay_3x: "scalapay",
  touchngo: "touchngo",
  walley: "walley",
  zip: "zip",
  giftcard: "adyen-giftcard",
  mealVoucher_FR_natixis: "titres-restaurant",
  mealVoucher_FR_sodexo: "titres-restaurant",
  mealVoucher_FR_groupeup: "titres-restaurant",
} as const;

const ADYEN_EMBEDDED_ALTERNATIVE_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE = {
  ...ADYEN_EMBEDDED_SHARED_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE,
  ...ADYEN_EMBEDDED_DISTINCT_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE,
} as const;

const ADYEN_EMBEDDED_ALTERNATIVE_PAYMENT_METHOD_TYPES = Object.keys(
  ADYEN_EMBEDDED_ALTERNATIVE_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE,
) as AdyenEmbeddedAlternativePaymentMethodType[];

const ADYEN_CARD_PAYMENT_METHOD_TYPES = new Set<string>(
  ADYEN_EMBEDDED_CARD_PAYMENT_METHOD_TYPES,
);

const ADYEN_ALTERNATIVE_PAYMENT_METHOD_TYPES = new Set<string>(
  ADYEN_EMBEDDED_ALTERNATIVE_PAYMENT_METHOD_TYPES,
);

const ADYEN_SHARED_PAYMENT_METHOD_TYPES = new Set<string>(
  Object.keys(ADYEN_EMBEDDED_SHARED_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE),
);

const ADYEN_DISTINCT_PAYMENT_METHOD_TYPES = new Set<string>(
  Object.keys(ADYEN_EMBEDDED_DISTINCT_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE),
);

type AdyenEmbeddedSharedPaymentMethodType =
  keyof typeof ADYEN_EMBEDDED_SHARED_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE;

type AdyenEmbeddedDistinctPaymentMethodType =
  keyof typeof ADYEN_EMBEDDED_DISTINCT_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE;

type AdyenWindow = Window & {
  AdyenWeb?: AdyenEmbeddedSdkNamespace;
};

type AdyenEmbeddedDiscoveredPaymentOption =
  | Extract<PaymentOption, { type: "new-card"; gateway: "adyen_embedded" }>
  | Extract<
      PaymentOption,
      {
        gateway: "adyen_embedded";
        adyen_payment_method_type: AdyenEmbeddedAlternativePaymentMethodType;
      }
    >
  | Extract<
      PaymentOption,
      {
        adyen_payment_method_type: AdyenEmbeddedAlternativePaymentMethodType;
      }
    >;

type InitializeAdyenEmbeddedSdkParams = {
  sessionId: string;
  sessionData: string;
  environment: AdyenEmbeddedEnvironment;
  clientKey: string;
  amount?: AdyenEmbeddedAmount;
  locale?: string;
  countryCode?: string;
};

export type InitializeAdyenEmbeddedSdkResult = {
  adyenEmbedded: AdyenEmbeddedSdkInstance;
  options: AdyenEmbeddedDiscoveredPaymentOption[];
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
  return getTrimmedString(value);
}

function isAdyenEmbeddedAlternativePaymentMethodType(
  value: string,
): value is AdyenEmbeddedAlternativePaymentMethodType {
  return ADYEN_ALTERNATIVE_PAYMENT_METHOD_TYPES.has(value);
}

function isAdyenEmbeddedSharedPaymentMethodType(
  value: string,
): value is AdyenEmbeddedSharedPaymentMethodType {
  return ADYEN_SHARED_PAYMENT_METHOD_TYPES.has(value);
}

function isAdyenEmbeddedDistinctPaymentMethodType(
  value: string,
): value is AdyenEmbeddedDistinctPaymentMethodType {
  return ADYEN_DISTINCT_PAYMENT_METHOD_TYPES.has(value);
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
  const sessionId = getTrimmedString(params.sessionId);
  const sessionData = getTrimmedString(params.sessionData);
  const clientKey = getTrimmedString(params.clientKey);
  const locale = getNormalizedLocale(params.locale);
  const countryCode = getNormalizedCountryCode(params.countryCode);
  const currency = getNormalizedCurrencyCode(params.amount?.currency);
  const amountValue = params.amount?.value;

  if (!sessionId) {
    throw new Error("Adyen session id is required.");
  }

  if (!sessionData) {
    throw new Error("Adyen session data is required.");
  }

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
    session: { id: sessionId, sessionData },
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

function toAdyenEmbeddedAlternativePaymentOptionType(
  methodType: AdyenEmbeddedAlternativePaymentMethodType,
): AdyenEmbeddedAlternativePaymentOptionType {
  return ADYEN_EMBEDDED_ALTERNATIVE_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE[
    methodType
  ];
}

function createAdyenEmbeddedSharedPaymentOption<
  MethodType extends AdyenEmbeddedSharedPaymentMethodType,
>(
  methodType: MethodType,
  paymentMethod: AdyenEmbeddedPaymentMethod,
): Extract<
  PaymentOption,
  {
    gateway: "adyen_embedded";
    adyen_payment_method_type: MethodType;
  }
> {
  const name = getTrimmedString(paymentMethod.name);

  return {
    type: toAdyenEmbeddedAlternativePaymentOptionType(methodType),
    gateway: "adyen_embedded",
    adyen_payment_method_type: methodType,
    ...(name ? { name } : {}),
    payment_method: paymentMethod,
  } as Extract<
    PaymentOption,
    {
      gateway: "adyen_embedded";
      adyen_payment_method_type: MethodType;
    }
  >;
}

function getAdyenDistinctPaymentGateway(
  methodType: AdyenEmbeddedDistinctPaymentMethodType,
): "adyen_embedded" | "adyen_redirect" {
  return methodType === "redirect" ? "adyen_redirect" : "adyen_embedded";
}

function createAdyenEmbeddedDistinctPaymentOption<
  MethodType extends AdyenEmbeddedDistinctPaymentMethodType,
>(
  methodType: MethodType,
  paymentMethod: AdyenEmbeddedPaymentMethod,
): Extract<
  PaymentOption,
  {
    adyen_payment_method_type: MethodType;
  }
> {
  const name = getTrimmedString(paymentMethod.name);

  return {
    type: ADYEN_EMBEDDED_DISTINCT_PAYMENT_OPTION_TYPE_BY_METHOD_TYPE[
      methodType
    ],
    gateway: getAdyenDistinctPaymentGateway(methodType),
    adyen_payment_method_type: methodType,
    ...(name ? { name } : {}),
    payment_method: paymentMethod,
  } as unknown as Extract<
    PaymentOption,
    {
      adyen_payment_method_type: MethodType;
    }
  >;
}

function createAdyenEmbeddedAlternativePaymentOption<
  MethodType extends AdyenEmbeddedAlternativePaymentMethodType,
>(
  methodType: MethodType,
  paymentMethod: AdyenEmbeddedPaymentMethod,
): AdyenEmbeddedDiscoveredPaymentOption {
  if (isAdyenEmbeddedSharedPaymentMethodType(methodType)) {
    return createAdyenEmbeddedSharedPaymentOption(methodType, paymentMethod);
  }

  if (isAdyenEmbeddedDistinctPaymentMethodType(methodType)) {
    return createAdyenEmbeddedDistinctPaymentOption(methodType, paymentMethod);
  }

  throw new Error(`Unsupported Adyen payment method type: ${methodType}`);
}

function getAdyenCheckoutKey(
  configuration: AdyenEmbeddedCheckoutConfiguration,
): string {
  return [
    configuration.environment,
    configuration.session.id,
    configuration.session.sessionData ?? "",
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

function isAdyenPaymentMethod(
  value: unknown,
): value is AdyenEmbeddedPaymentMethod {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function discoverAdyenEmbeddedPaymentOptions(
  adyenEmbedded: AdyenEmbeddedSdkInstance,
): AdyenEmbeddedDiscoveredPaymentOption[] {
  const paymentMethods = adyenEmbedded.paymentMethodsResponse?.paymentMethods;

  if (!Array.isArray(paymentMethods)) {
    return [];
  }

  const options: AdyenEmbeddedDiscoveredPaymentOption[] = [];
  const seenMethodTypes = new Set<string>();
  let hasCardOption = false;

  for (const paymentMethod of paymentMethods) {
    if (!isAdyenPaymentMethod(paymentMethod)) {
      continue;
    }

    const methodType = getTrimmedString(paymentMethod.type);

    if (!methodType) {
      continue;
    }

    if (ADYEN_CARD_PAYMENT_METHOD_TYPES.has(methodType)) {
      if (hasCardOption) {
        continue;
      }

      hasCardOption = true;
      options.push({
        type: "new-card",
        gateway: "adyen_embedded",
        adyen_payment_method_type: methodType as "card" | "scheme",
      });
      continue;
    }

    if (seenMethodTypes.has(methodType)) {
      continue;
    }

    if (!isAdyenEmbeddedAlternativePaymentMethodType(methodType)) {
      continue;
    }

    seenMethodTypes.add(methodType);

    options.push(
      createAdyenEmbeddedAlternativePaymentOption(methodType, paymentMethod),
    );
  }

  return options;
}

export async function initializeAdyenEmbeddedSdk(
  params: InitializeAdyenEmbeddedSdkParams,
): Promise<InitializeAdyenEmbeddedSdkResult> {
  const configuration = getAdyenCheckoutConfiguration(params);
  const adyenEmbedded = await createAdyenCheckout(configuration);

  return {
    adyenEmbedded,
    options: discoverAdyenEmbeddedPaymentOptions(adyenEmbedded),
  };
}
