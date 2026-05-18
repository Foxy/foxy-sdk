/** Checkout hosting modes supported by Sezzle's browser SDK. */
export type SezzleCheckoutMode = "popup" | "iframe" | "redirect";

/** API environments supported by Sezzle's browser SDK. */
export type SezzleCheckoutApiMode = "live" | "sandbox";

/** Version values currently documented by Sezzle's browser SDK. */
export type SezzleCheckoutApiVersion = "v2";

/** Constructor configuration accepted by Sezzle's browser SDK. */
export type SezzleCheckoutConfiguration = {
  /** Public API key used when creating a Sezzle checkout instance. */
  publicKey: string;
  /** Optional Sezzle environment override. */
  apiMode?: SezzleCheckoutApiMode;
  /** Optional Sezzle SDK API version override. */
  apiVersion?: SezzleCheckoutApiVersion;
  /** Optional checkout hosting mode override. */
  mode?: SezzleCheckoutMode;
};

/** Event payload forwarded by Sezzle completion callbacks. */
export type SezzleCheckoutEvent = {
  /** Provider-specific checkout data emitted by Sezzle. */
  data?: Record<string, unknown>;
  /** Additional provider-specific properties emitted by Sezzle. */
  [key: string]: unknown;
};

/** Event handlers accepted by Sezzle during checkout initialization. */
export type SezzleCheckoutInitOptions = {
  /** Called when the Sezzle button is clicked. */
  onClick?: (event: Event) => void;
  /** Called when the Sezzle checkout completes successfully. */
  onComplete?: (event: SezzleCheckoutEvent) => void;
  /** Called when the buyer cancels the Sezzle checkout. */
  onCancel?: () => void;
  /** Called when the Sezzle checkout fails. */
  onFailure?: () => void;
};

/** Parameters for starting a Sezzle checkout from a created payload. */
export type SezzleStartCheckoutByPayloadOptions = {
  /** Checkout payload returned by the integrator's backend. */
  checkout_payload: Record<string, unknown>;
};

/** Parameters for starting a Sezzle checkout from an existing checkout URL. */
export type SezzleStartCheckoutByUrlOptions = {
  /** Existing Sezzle checkout URL returned by the integrator's backend. */
  checkout_url: string;
};

/** Parameters for capturing an authorized Sezzle payment. */
export type SezzleCapturePaymentOptions = {
  /** Amount to capture from a previously authorized order. */
  capture_amount: {
    amount_in_cents: number;
    currency: string;
  };
};

/** Public instance returned by Sezzle's browser SDK constructor. */
export interface SezzleSdkInstance {
  /** Registers checkout lifecycle callbacks on the Sezzle instance. */
  init(options: SezzleCheckoutInitOptions): void;

  /** Starts the Sezzle checkout flow using a payload or checkout URL. */
  startCheckout(
    options:
      | SezzleStartCheckoutByPayloadOptions
      | SezzleStartCheckoutByUrlOptions,
  ): void;

  /** Renders Sezzle's smart button into a provided element or selector. */
  renderSezzleButton(container: HTMLElement | string): void;

  /** Captures an authorized Sezzle order. */
  capturePayment(
    orderUuid: string,
    payload: SezzleCapturePaymentOptions,
  ): Promise<unknown> | unknown;

  /** Returns installment plan data for a provided amount in cents. */
  getInstallmentPlan(totalInCents: number): Promise<unknown> | unknown;
}

/** Browser constructor exposed by Sezzle's browser SDK script. */
export type SezzleSdkConstructor = new (
  options: SezzleCheckoutConfiguration,
) => SezzleSdkInstance;
