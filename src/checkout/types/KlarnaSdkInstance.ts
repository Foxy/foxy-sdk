/** Container accepted by Klarna when rendering a widget. */
export type KlarnaPaymentsContainer = HTMLElement | string;

/** Generic session update payload accepted by Klarna Payments SDK methods. */
export type KlarnaPaymentsSessionData = Record<string, unknown>;

/** Adjustable Klarna validation error returned in widget callbacks. */
export type KlarnaPaymentsError = {
  /** Session fields Klarna expects the integrator or buyer to correct. */
  invalid_fields?: string[];
  /** Additional provider-specific error properties returned by Klarna. */
  [key: string]: unknown;
};

/** Parameters for initializing the Klarna Payments SDK. */
export type KlarnaPaymentsInitOptions = {
  /** Client token returned by Klarna when the payment session is initiated. */
  client_token: string;
};

/** Category mapping used when loading or authorizing multiple Klarna widgets. */
export type KlarnaPaymentsCategoryInstance = {
  /** Klarna payment method category to render or authorize. */
  payment_method_category: string;
  /** Unique widget instance identifier paired with the rendered container. */
  instance_id: string;
};

/** Parameters for rendering the Klarna widget with load(). */
export type KlarnaPaymentsLoadOptions = {
  /** Element or CSS selector where Klarna should render the widget. */
  container: KlarnaPaymentsContainer;
  /** Payment method Klarna should pre-select when the method is supported. */
  preferred_payment_method?: string;
  /** Single payment method category to load into the widget. */
  payment_method_category?: string;
  /** Multiple payment method categories to load in a multi-widget flow. */
  payment_method_categories?: KlarnaPaymentsCategoryInstance[];
};

/** Response passed to the load() callback after Klarna pre-assessment completes. */
export type KlarnaPaymentsLoadResult = {
  /** Whether the Klarna widget should remain visible to the buyer. */
  show_form: boolean;
  /** Adjustable validation errors returned by Klarna, when present. */
  error?: KlarnaPaymentsError;
};

/** Callback invoked after Klarna completes the load() pre-assessment. */
export type KlarnaPaymentsLoadCallback = (
  result: KlarnaPaymentsLoadResult,
) => void;

/** Parameters for rendering Klarna's payment review widget. */
export type KlarnaPaymentsLoadPaymentReviewOptions = {
  /** Element or CSS selector where Klarna should render the review widget. */
  container: KlarnaPaymentsContainer;
};

/** Response passed to the loadPaymentReview() callback. */
export type KlarnaPaymentsLoadPaymentReviewResult = {
  /** Whether the Klarna review widget should be displayed. */
  show_form: boolean;
};

/** Callback invoked after Klarna finishes loading the review widget. */
export type KlarnaPaymentsLoadPaymentReviewCallback = (
  result: KlarnaPaymentsLoadPaymentReviewResult,
) => void;

/** Parameters for authorize(). */
export type KlarnaPaymentsAuthorizeOptions = {
  /** Disables auto-finalization for direct bank transfer when supported. */
  auto_finalize?: boolean;
  /** Single payment method category that was previously loaded. */
  payment_method_category?: string;
  /** Multiple payment method categories that were previously loaded. */
  payment_method_categories?: KlarnaPaymentsCategoryInstance[];
};

/** Result returned by authorize() and finalize(). */
export type KlarnaPaymentsAuthorizationResult = {
  /** Whether Klarna approved the credit and fraud assessment. */
  approved: boolean;
  /** Whether the Klarna widget should remain visible to the buyer. */
  show_form: boolean;
  /** Authorization token required to place the order after approval. */
  authorization_token?: string;
  /** Whether finalize() must be called to complete authorization. */
  finalize_required?: boolean;
  /** Adjustable validation errors returned by Klarna, when present. */
  error?: KlarnaPaymentsError;
};

/** Callback invoked after authorize() completes. */
export type KlarnaPaymentsAuthorizeCallback = (
  result: KlarnaPaymentsAuthorizationResult,
) => void;

/** Parameters for reauthorize(). */
export type KlarnaPaymentsReauthorizeOptions = {
  /** Single payment method category that should be reauthorized. */
  payment_method_category: string;
};

/** Result returned by reauthorize(). */
export type KlarnaPaymentsReauthorizeResult = {
  /** Whether Klarna approved the updated order state. */
  approved: boolean;
  /** Authorization token required to place the updated order after approval. */
  authorization_token?: string;
  /** Adjustable validation errors returned by Klarna, when present. */
  error?: KlarnaPaymentsError;
  /** Deprecated Klarna field that may still appear in some responses. */
  show_form?: boolean;
};

/** Callback invoked after reauthorize() completes. */
export type KlarnaPaymentsReauthorizeCallback = (
  result: KlarnaPaymentsReauthorizeResult,
) => void;

/** Parameters for finalize(). */
export type KlarnaPaymentsFinalizeOptions = {
  /** Single payment method category that was previously loaded. */
  payment_method_category: string;
};

/** Callback invoked after finalize() completes. */
export type KlarnaPaymentsFinalizeCallback = (
  result: KlarnaPaymentsAuthorizationResult,
) => void;

/** Event names emitted by Klarna.Payments.on(). */
export type KlarnaPaymentsEventName =
  | "heightChanged"
  | "fullscreenOverlayShown"
  | "fullscreenOverlayHidden";

/** Event payloads emitted by the Klarna Payments SDK. */
export type KlarnaPaymentsEventMap = {
  /** New iframe height in pixels. */
  heightChanged: number;
  /** No payload is emitted when the fullscreen overlay is shown. */
  fullscreenOverlayShown: undefined;
  /** No payload is emitted when the fullscreen overlay is hidden. */
  fullscreenOverlayHidden: undefined;
};

/** Event handler signature for Klarna Payments SDK events. */
export type KlarnaPaymentsEventHandler<
  TEventName extends KlarnaPaymentsEventName,
> = KlarnaPaymentsEventMap[TEventName] extends undefined
  ? () => void
  : (payload: KlarnaPaymentsEventMap[TEventName]) => void;

/** Public Payments namespace exposed by Klarna's browser SDK. */
export interface KlarnaPaymentsApi {
  /**
   * Initializes the Klarna Payments SDK with the client token returned by the
   * initiate payment session call.
   */
  init(options: KlarnaPaymentsInitOptions): void;

  /**
   * Renders one or more Klarna payment widgets and runs Klarna's
   * pre-assessment flow.
   */
  load(
    options: KlarnaPaymentsLoadOptions,
    callback: KlarnaPaymentsLoadCallback,
  ): void;
  load(
    options: KlarnaPaymentsLoadOptions,
    data: KlarnaPaymentsSessionData,
    callback: KlarnaPaymentsLoadCallback,
  ): void;

  /**
   * Loads Klarna's payment review widget for supported multi-step US flows.
   */
  loadPaymentReview(
    options: KlarnaPaymentsLoadPaymentReviewOptions,
    callback: KlarnaPaymentsLoadPaymentReviewCallback,
  ): void;

  /**
   * Runs Klarna's authorization flow for a widget that has already been
   * rendered with load().
   */
  authorize(
    options: KlarnaPaymentsAuthorizeOptions,
    callback: KlarnaPaymentsAuthorizeCallback,
  ): void;
  authorize(
    options: KlarnaPaymentsAuthorizeOptions,
    data: KlarnaPaymentsSessionData,
    callback: KlarnaPaymentsAuthorizeCallback,
  ): void;

  /**
   * Reauthorizes a previously approved Klarna session after the order details
   * have changed.
   */
  reauthorize(
    options: KlarnaPaymentsReauthorizeOptions,
    callback: KlarnaPaymentsReauthorizeCallback,
  ): void;
  reauthorize(
    options: KlarnaPaymentsReauthorizeOptions,
    data: KlarnaPaymentsSessionData,
    callback: KlarnaPaymentsReauthorizeCallback,
  ): void;

  /**
   * Finalizes authorizations for payment methods that require an additional
   * completion step.
   */
  finalize(
    options: KlarnaPaymentsFinalizeOptions,
    callback: KlarnaPaymentsFinalizeCallback,
  ): void;
  finalize(
    options: KlarnaPaymentsFinalizeOptions,
    data: KlarnaPaymentsSessionData,
    callback: KlarnaPaymentsFinalizeCallback,
  ): void;

  /** Registers an event handler for a supported Klarna Payments event. */
  on<TEventName extends KlarnaPaymentsEventName>(
    eventName: TEventName,
    eventHandler: KlarnaPaymentsEventHandler<TEventName>,
  ): void;

  /** Removes one event handler or all handlers for a supported event name. */
  off<TEventName extends KlarnaPaymentsEventName>(
    eventName: TEventName,
    eventHandler?: KlarnaPaymentsEventHandler<TEventName>,
  ): void;
}

/** Browser namespace exposed by Klarna after their SDK script has loaded. */
export type KlarnaSdkInstance = {
  /** Payments API used to initialize, render, authorize, and observe Klarna widgets. */
  Payments: KlarnaPaymentsApi;
};
