/** Log level for each method, matching Consola's numbering so a `level` value from v1 behaves the same. */
const LEVELS = {
  error: 0,
  warn: 1,
  info: 3,
  success: 3,
  trace: 5,
} as const;

/** Default level, matching Consola's default of Info. */
const DEFAULT_LEVEL = 3;

/** Console method each logger method writes through. */
const METHODS = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  success: 'info',
  trace: 'debug',
} as const;

/** Logger init parameters. */
type Init = {
  /** Numeric log level. Methods above this level are no-ops. Defaults to 3 (Info). */
  level?: number;
  /** Prefix written before every message. Omitted when empty. */
  tag?: string;
};

/**
 * Minimal logger used by API clients in this SDK. Replaces the `consola`
 * dependency v1 used, keeping its numeric level semantics: a lower `level` is
 * quieter, and any negative value silences everything.
 */
export type Logger = { [Method in keyof typeof LEVELS]: (...args: unknown[]) => void };

/**
 * Creates a logger writing through the global console.
 *
 * @param init Level and tag.
 * @returns Logger instance.
 */
export function createLogger(init: Init): Logger {
  const level = init.level ?? DEFAULT_LEVEL;
  const prefix = init.tag ? [`[${init.tag}]`] : [];

  const create = (method: keyof typeof LEVELS) => {
    return (...args: unknown[]): void => {
      if (LEVELS[method] > level) return;
      console[METHODS[method]](...prefix, ...args);
    };
  };

  return {
    error: create('error'),
    info: create('info'),
    success: create('success'),
    trace: create('trace'),
    warn: create('warn'),
  };
}
