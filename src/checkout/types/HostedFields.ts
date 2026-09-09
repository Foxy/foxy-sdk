export type AchHostedFieldsPublicState = {
  empty: boolean;
  complete: boolean;
  errorCode: string | null;
  focused?: boolean;
  touched?: boolean;
};

export type AchHostedFieldsTokenizeErrorCode =
  | 'invalid_state'
  | 'validation_failed'
  | 'collect_timeout'
  | 'tokenization_network_error'
  | 'tokenization_failed'
  | 'unknown_error';

export type CardValidationField = 'cc-number' | 'cc-exp' | 'cc-csc' | 'form';

/**
 * Why a card tokenization attempt failed.
 *
 * The vault mint (`POST /tokenize`) answers with a machine context rather than
 * shopper text, so the host renders the copy — before the vault, every one of
 * these came back as one generic card-number error. The first three are the
 * element's own states, raised without ever reaching the mint.
 */
export type CardEmbedTokenizeErrorCode =
  // The element was asked to tokenize before it could.
  | 'invalid_state'
  // No usable configuration was inlined for the element to mint against.
  | 'invalid_config'
  // The mint refused and said nothing usable about why.
  | 'tokenization_failed'
  // The mint was never reached.
  | 'tokenization_network_error'
  // Refusals that blame one input, and belong on that field rather than the form.
  | 'card_number_invalid'
  | 'card_expiry_invalid'
  | 'card_csc_invalid'
  | 'card_brand_unsupported'
  // CSC-only mode: no saved card could be resolved from the session. Deliberately
  // one context for "not logged in", "no default card" and "that card is a
  // gateway token" — the shopper's move is the same in all three.
  | 'saved_card_unavailable'
  // The store's payment configuration changed under the element.
  | 'tokenization_config_stale'
  // A hosted gateway backs this store; its SDK mints, not the vault.
  | 'tokenization_not_supported_for_provider'
  // Card-testing protection: too many attempts from this address.
  | 'rate_limited'
  // Bug-shaped, not shopper-actionable.
  | 'malformed_request'
  | 'method_not_allowed';

/**
 * Why the card-entry shell could not resolve a configuration at all.
 *
 * A different channel from the codes above: the shell posts one of these to the
 * parent at load time and never imports the element bundle, so no tokenization
 * is ever attempted. All four are merchant configuration problems.
 */
export type CardEmbedConfigErrorCode =
  | 'tokenization_config_not_found'
  | 'tokenization_config_no_provider'
  | 'tokenization_config_brand_parity'
  | 'tokenization_config_incomplete';
