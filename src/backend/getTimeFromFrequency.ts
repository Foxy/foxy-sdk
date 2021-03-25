/**
 * Instances of this error are thrown by `getTimeFromFrequency` when
 * provided with unsupported frequency.
 */
export class InvalidFrequencyError extends Error {
  constructor(frequency: string) {
    super(`Invalid frequency "${frequency}".`);
  }
}

/**
 * Gives a rough estimate for a number of milliseconds in the given frequency.
 *
 * IMPORTANT: this function SHOULD NOT be used to calculate precise dates
 * as it doesn't account for leap years, months of variable length, etc. It works
 * best for broad estimates and comparing frequencies.
 *
 * @param frequency Frequency as positive integer + units (y, m, w, d for years, months, weeks and days respectively). You can use .5m for twice a month. Example: 1m (1 month), 4y (4 years).
 * @throws InvalidFrequencyError when provided with unsupported frequency.
 * @returns Estimated number of milliseconds in the given frequency.
 */
export function getTimeFromFrequency(frequency: string): number {
  const DAY = 86400000;
  const MONTH = 31 * DAY;

  if (frequency === '.5m') return MONTH / 2;

  const YEAR = 365 * DAY;
  const WEEK = 7 * DAY;

  const count = parseInt(frequency.substring(0, frequency.length - 1));
  if (isNaN(count)) throw new InvalidFrequencyError(frequency);

  if (frequency.endsWith('y')) return count * YEAR;
  if (frequency.endsWith('m')) return count * MONTH;
  if (frequency.endsWith('w')) return count * WEEK;
  if (frequency.endsWith('d')) return count * DAY;

  throw new InvalidFrequencyError(frequency);
}
