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
