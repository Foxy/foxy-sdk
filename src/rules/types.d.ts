/**
 * Any JSON value a rule can be evaluated against. Deliberately `unknown` rather
 * than `Record<string, unknown>`: callers pass `Omit<Resource<Subscription>,
 * '_links' | '_embedded'>`, an intersection of mapped and conditional types that
 * is not reliably assignable to an index-signature type, and jsonata's
 * `evaluate(input: any)` accepts anything regardless.
 */
export type RuleSubject = unknown;

/** A single frequency modification rule. */
export type FrequencyRule = {
  /** A valid {@link https://jsonata.org/ JSONata} query selecting the subscriptions this rule applies to. */
  jsonataQuery: string;
  /** Frequencies this rule allows. */
  values: string[];
};

/** A single next transaction date modification rule. */
export type NextDateRule = {
  /** Beginning of the time period this rule applies to, as a frequency. Example: `2w`. */
  min?: string;
  /** End of the time period this rule applies to, as a frequency. Example: `1y`. */
  max?: string;
  /** A valid {@link https://jsonata.org/ JSONata} query selecting the subscriptions this rule applies to. */
  jsonataQuery: string;
  /** Dates (YYYY-MM-DD) or ranges (YYYY-MM-DD..YYYY-MM-DD) that cannot be picked. */
  disallowedDates?: string[];
  /** Days available for selection, either days of week (1-7, Monday first) or days of month (1-31). */
  allowedDays?: { type: 'day'; days: number[] } | { type: 'month'; days: number[] };
};

/** False disables modification, true lifts all constraints, an array defines custom rules. */
export type NextDateRules = boolean | NextDateRule[];

/** Merged result of every applicable next date modification rule. */
export type Constraints = {
  min?: string;
  max?: string;
  disallowedDates?: string[];
  allowedDaysOfWeek?: number[];
  allowedDaysOfMonth?: number[];
};
