const MS = 1;
const SECOND = MS * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const YEAR = DAY * 365.25;
const MONTH = YEAR / 12;

/** Unit names and their length in milliseconds. */
const UNITS: Readonly<Record<string, number>> = Object.freeze(
  Object.assign(Object.create(null) as Record<string, number>, {
    b: MONTH,
    d: DAY,
    day: DAY,
    h: HOUR,
    hour: HOUR,
    hr: HOUR,
    m: MINUTE,
    microsecond: MS / 1e3,
    millisecond: MS,
    min: MINUTE,
    minute: MINUTE,
    month: MONTH,
    ms: MS,
    nanosecond: MS / 1e6,
    ns: MS / 1e6,
    s: SECOND,
    sec: SECOND,
    second: SECOND,
    us: MS / 1e3,
    w: WEEK,
    week: WEEK,
    wk: WEEK,
    y: YEAR,
    year: YEAR,
    yr: YEAR,
    µs: MS / 1e3,
    μs: MS / 1e3,
  })
);

/**
 * A number (optionally negative, fractional or in exponent notation) followed by optional
 * whitespace and a unit name. Each alternative is unambiguous and the unit is length-limited
 * (the longest known unit, `microseconds`, has 12 characters), so matching runs in linear time.
 */
const TOKEN = /(-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?)\s*([a-zµμ]{0,16})/gi;

/**
 * Looks up the length of a unit in milliseconds, ignoring case and a trailing plural `s`.
 *
 * @param name Unit name as written.
 * @returns Unit length in milliseconds or undefined for unknown units.
 */
function getUnit(name: string): number | undefined {
  return UNITS[name] || UNITS[name.toLowerCase().replace(/s$/, '')];
}

/**
 * Converts a human-readable duration such as `2w`, `1y` or `1h 30m` to milliseconds.
 * Numbers without a known unit are ignored. Note that `m` stands for minutes here.
 *
 * @param input Duration string.
 * @returns Duration in milliseconds or null if the input doesn't contain any durations.
 */
export function parseDuration(input: string): number | null {
  let result: number | null = null;

  input.replace(/(\d),(\d)/g, '$1$2').replace(TOKEN, (_, value: string, unitName: string) => {
    const unit = getUnit(unitName);
    if (unit) result = (result ?? 0) + parseFloat(value) * unit;
    return '';
  });

  return result;
}
