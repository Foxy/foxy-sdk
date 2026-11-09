/** Gateway (or 3DS provider) a `requires_action` next action is occurring with. */
export type NextActionGateway =
  | "stripe_v2"
  | "square_up"
  | "adyen_embedded"
  | "klarna"
  | "paypal_platform"
  | "braintree_sdk"
  | "cardinal";

export type RequiresActionNextAction = {
  /** The client-side step the customer must complete before the payment resolves. */
  type: "confirm_intent" | "three_ds_challenge" | "captcha";
  /** Signed, single-use JWT sent back to `POST /checkout?action=continue` to resume the transaction. */
  resume_token: string;
  /** Gateway (or 3DS provider) this action is occurring with. */
  gateway: NextActionGateway;
  /** Opaque, provider-specific payload passed straight to the matching SDK adapter. */
  params: Record<string, unknown>;
};

/**
 * `params` of a `confirm_intent` action raised by `stripe_v2`.
 *
 * The submit leg creates an unconfirmed PaymentIntent server-side and hands
 * back only its client secret — nothing is authorized yet. The client confirms
 * it with the mounted Payment Element, then resumes with
 * `POST /checkout?action=continue`, which verifies the outcome with Stripe
 * server-to-server. There is no client-minted token in this flow.
 */
export type StripeConfirmIntentParams = {
  /** Client secret of the unconfirmed PaymentIntent to confirm. */
  client_secret: string;
};

/**
 * `params` of a `three_ds_challenge` action raised by `adyen_embedded`: the
 * fields of Adyen's `/payments` response that the Drop-in needs to run the
 * action. The Drop-in's `onAdditionalDetails` state data then goes back as
 * `sdkResult` in `continueCheckOut`.
 */
export type AdyenEmbeddedThreeDsChallengeParams = {
  /** Adyen's `resultCode`, such as `IdentifyShopper` or `ChallengeShopper`. */
  resultCode: string;
  /** Adyen's `action` object, passed to the Drop-in as is. */
  action: Record<string, unknown>;
};

export type RedirectNextAction = {
  /** Full-page, offsite redirect required to complete the checkout (hosted / BNPL gateways, 3DS v1). */
  type: "redirect";
  /** Server-sourced redirect destination. */
  url: string;
  /** GET navigates directly to `url`; POST auto-submits a hidden form built from `body`. */
  method: "GET" | "POST";
  /** Server-sourced form fields to submit when `method` is `POST`. */
  body?: Record<string, string>;
};

/** Follow-up action the client must take before a checkout submission resolves. */
export type NextAction = RequiresActionNextAction | RedirectNextAction;
