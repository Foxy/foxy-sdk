export type AchHostedFieldsPublicState = {
  empty: boolean;
  complete: boolean;
  errorCode: string | null;
  focused?: boolean;
  touched?: boolean;
};

export type AchHostedFieldsTokenizeErrorCode =
  | "invalid_state"
  | "validation_failed"
  | "collect_timeout"
  | "tokenization_network_error"
  | "tokenization_failed"
  | "unknown_error";

export type CardValidationField = "cc-number" | "cc-exp" | "cc-csc" | "form";

export type CardEmbedTokenizeErrorCode = "invalid_state" | "invalid_config" | "tokenization_failed";