export type FraudProtection = {
  /** reCAPTCHA v2 checkbox is the only client-side protection so far. */
  type: "google_recaptcha";
  /** Site key to render the widget with. */
  site_key: string;
};
