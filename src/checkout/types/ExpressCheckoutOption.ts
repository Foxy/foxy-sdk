export type ApplePayExpressCheckoutOption = {
  type: 'apple-pay';
};

export type GooglePayExpressCheckoutOption = {
  type: 'google-pay';
};

export type StripeExpressCheckoutElementOption = {
  type: 'stripe-express-checkout-element';
  /** Gateway used for this express checkout option. */
  gateway: 'stripe_v2';
  /** Stripe publishable key for initializing Stripe.js. */
  publishable_key: string;
};

export type ExpressCheckoutType = 'apple-pay' | 'google-pay' | 'stripe-express-checkout-element';

export type ExpressCheckoutOption =
  | ApplePayExpressCheckoutOption
  | GooglePayExpressCheckoutOption
  | StripeExpressCheckoutElementOption;
