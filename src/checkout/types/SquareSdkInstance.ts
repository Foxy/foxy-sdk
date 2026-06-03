/** Represents a tokenized payment method returned by Square card/ACH components. */
export type SquareTokenResult = {
  /** The nonce or token string to send to the server when present. */
  token?: string;
  /** Token creation status — "OK" on success. */
  status: string;
  /** Errors reported by Square when tokenization fails. */
  errors?: { field?: string; message: string; type: string }[];
};

/** Options accepted by Square card component's tokenize() method. */
export type SquareTokenizeOptions = {
  /** Billing contact details included with tokenization. */
  billingContact?: {
    addressLines?: string[];
    city?: string;
    countryCode?: string;
    email?: string;
    familyName?: string;
    givenName?: string;
    phone?: string;
    postalCode?: string;
    state?: string;
  };
};

/** A renderable Square payment component (Card, ACH, Google Pay, Apple Pay). */
export type SquarePaymentComponent = {
  /** Attaches the component to the given DOM element or CSS selector. */
  attach(selector: string | HTMLElement): Promise<void>;
  /** Destroys the component and removes it from the DOM. */
  destroy(): Promise<void>;
  /** Tokenizes the payment details captured by this component. */
  tokenize(options?: SquareTokenizeOptions): Promise<SquareTokenResult>;
};

/** Options for Square ACH component. */
export type SquareAchOptions = {
  /** Redirect URL for OAuth bank authorization flows. */
  redirectURI?: string;
  /** Payment transaction ID for ACH linking. */
  transactionId?: string;
};

/** Options passed to Square.payments() initialization. */
export type SquarePaymentsOptions = {
  /** Locale override for UI components. */
  locale?: string;
};

/** The initialized Payments instance returned by Square.payments(). */
export type SquareSdkInstance = {
  /** Creates a Card payment component for rendering a card input form. */
  card(options?: Record<string, unknown>): Promise<SquarePaymentComponent>;
  /** Creates an ACH bank-transfer component. */
  ach(options?: SquareAchOptions): Promise<SquarePaymentComponent>;
  /** Creates a Google Pay button component. */
  googlePay(paymentRequest: unknown): Promise<SquarePaymentComponent>;
  /** Creates an Apple Pay button component. */
  applePay(paymentRequest: unknown): Promise<SquarePaymentComponent>;
  /** Verifies the buyer's identity for SCA / 3DS flows. */
  verifyBuyer(token: string, verificationDetails: Record<string, unknown>): Promise<{ token: string }>;
  /** Creates a payment request object used by wallet payment methods. */
  paymentRequest(details: Record<string, unknown>): unknown;
};

/** The Square namespace exposed on window.Square after the SDK script loads. */
export type SquareSdkNamespace = {
  /** Initializes the Payments SDK for the given application and location. */
  payments(applicationId: string, locationId: string, options?: SquarePaymentsOptions): Promise<SquareSdkInstance>;
};
