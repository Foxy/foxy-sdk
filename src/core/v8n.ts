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

  constructor(failures: ArgumentFailure[]) {
    const details = failures.map(({ field, rule }) => `${field} (${rule})`).join(', ');
    super(`Invalid argument: ${details}`);
    this.name = 'ArgumentError';
    this.failures = failures;
  }
}

/**
 * Walks a v8n error tree and records the path and rule name of each failing leaf.
 *
 * @param err v8n error or one of its causes.
 * @param field Path to the value checked at this level.
 * @param failures Array to add failures to.
 */
function collectFailures(err: unknown, field: string, failures: ArgumentFailure[]): void {
  if (!err || typeof err !== 'object') return;

  const { rule, cause, target } = err as V8NFailure;
  const path = typeof target === 'string' ? `${field}.${target}` : field;
  const causes = (Array.isArray(cause) ? cause : [cause]).filter(item => item && typeof item === 'object');

  if (causes.length > 0) {
    causes.forEach(item => collectFailures(item, path, failures));
  } else {
    const modifiers = (rule?.modifiers ?? []).map(modifier => String(modifier?.name ?? '')).filter(Boolean);
    const name = typeof rule?.name === 'string' ? rule.name : 'unknown';
    failures.push({ field: path, rule: [...modifiers, name].join('.') });
  }
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
    const failures: ArgumentFailure[] = [];
    collectFailures(err, name, failures);
    throw new ArgumentError(failures.length > 0 ? failures : [{ field: name, rule: 'unknown' }]);
  }
}
