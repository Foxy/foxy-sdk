import v8n from 'v8n';

v8n.extend({
  curieChain: () => {
    return (value: unknown) =>
      Array.isArray(value) && value[0] instanceof URL && value.slice(1).every(i => typeof i === 'string');
  },
  typeOf: (expected: string) => {
    return (value: unknown) => typeof value === expected;
  },
});

export { v8n };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type V8N = { check: (...args: any[]) => boolean };

export const storageV8N = v8n().schema({
  clear: v8n().typeOf('function'),
  getItem: v8n().typeOf('function'),
  key: v8n().typeOf('function'),
  length: v8n().number(),
  removeItem: v8n().typeOf('function'),
  setItem: v8n().typeOf('function'),
});

type V8NFailure = {
  rule?: { name?: unknown; modifiers?: { name?: unknown }[] } | null;
  cause?: unknown;
  target?: unknown;
};

/** A field that failed validation and the name of the rule it failed. */
export type ArgumentFailure = { field: string; rule: string };

/**
 * Thrown when a function argument fails validation. Names the failing fields and rules,
 * but never holds the argument values, since they can include secrets.
 */
export class ArgumentError extends TypeError {
  readonly failures: ArgumentFailure[];

  /** Error thrown by your code during validation (e.g. a throwing getter), if any. Never a v8n error. */
  readonly cause?: unknown;

  constructor(failures: ArgumentFailure[], cause?: unknown) {
    const details = failures.map(({ field, rule }) => `${field} (${rule})`).join(', ');
    super(`Invalid argument: ${details}`);
    this.name = 'ArgumentError';
    this.failures = failures;
    if (cause !== undefined) this.cause = cause;
  }
}

/**
 * Checks if a value is a v8n validation error (as opposed to an error thrown inside a rule).
 *
 * @param err Value to check.
 * @returns True for v8n errors.
 */
function isV8NError(err: unknown): err is V8NFailure {
  return !!err && typeof err === 'object' && 'rule' in (err as V8NFailure);
}

/**
 * Appends `target` to `field` when it's a string.
 *
 * @param field Path to the parent value.
 * @param target Key set by v8n's schema rule.
 * @returns Path to the value.
 */
function joinPath(field: string, target: unknown): string {
  return typeof target === 'string' ? `${field}.${target}` : field;
}

/**
 * Walks a v8n error tree and records the path and rule name of each failing leaf.
 *
 * @param err v8n error.
 * @param field Path to the value checked at this level.
 * @param failures Array to add failures to.
 * @param errors Array to add non-v8n errors thrown inside rules to.
 */
function collectFailures(err: V8NFailure, field: string, failures: ArgumentFailure[], errors: unknown[]): void {
  const { rule, cause, target } = err;
  const path = joinPath(field, target);
  const causes = (Array.isArray(cause) ? cause : [cause]).filter(item => item && typeof item === 'object');
  const modifiers = (rule?.modifiers ?? []).map(modifier => String(modifier?.name ?? '')).filter(Boolean);
  const ruleName = [...modifiers, typeof rule?.name === 'string' ? rule.name : 'unknown'].join('.');

  if (causes.length === 0) {
    failures.push({ field: path, rule: ruleName });
    return;
  }

  causes.forEach(item => {
    if (isV8NError(item)) {
      collectFailures(item, path, failures, errors);
    } else {
      // A rule threw (e.g. a getter on the value) – report it under this rule and keep the original error.
      failures.push({ field: joinPath(path, (item as V8NFailure).target), rule: ruleName });
      errors.push(item);
    }
  });
}

/**
 * Validates a value with a v8n validator. On failure, throws an {@link ArgumentError}
 * instead of the v8n error, which holds the value being validated.
 *
 * @param validator v8n validator to run.
 * @param value Value to validate.
 * @param name Argument name to use in the error message.
 */
export function checkArgument(validator: V8N, value: unknown, name: string): void {
  try {
    validator.check(value);
  } catch (err) {
    if (!isV8NError(err)) throw err;

    const failures: ArgumentFailure[] = [];
    const errors: unknown[] = [];
    collectFailures(err, name, failures, errors);
    throw new ArgumentError(failures, errors[0]);
  }
}
