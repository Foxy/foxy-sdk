import { parseDuration } from '../../src/backend/parseDuration';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365.25 * DAY;
const MONTH = YEAR / 12;

describe('Backend', () => {
  describe('parseDuration', () => {
    it('parses frequency-style values used in next date constraints', () => {
      expect(parseDuration('1d')).toBe(DAY);
      expect(parseDuration('30d')).toBe(30 * DAY);
      expect(parseDuration('2w')).toBe(2 * WEEK);
      expect(parseDuration('1y')).toBe(YEAR);
      expect(parseDuration('1.5y')).toBe(1.5 * YEAR);
    });

    it('treats m as minutes', () => {
      expect(parseDuration('1m')).toBe(MINUTE);
      expect(parseDuration('12m')).toBe(12 * MINUTE);
      expect(parseDuration('.5m')).toBe(MINUTE / 2);
    });

    it('supports long, plural and mixed-case unit names', () => {
      expect(parseDuration('1 week')).toBe(WEEK);
      expect(parseDuration('2 weeks')).toBe(2 * WEEK);
      expect(parseDuration('3 Days')).toBe(3 * DAY);
      expect(parseDuration('1Months')).toBe(MONTH);
      expect(parseDuration('1b')).toBe(MONTH);
      expect(parseDuration('2yrs')).toBe(2 * YEAR);
      expect(parseDuration('1 min')).toBe(MINUTE);
      expect(parseDuration('1hr')).toBe(HOUR);
    });

    it('supports sub-millisecond units', () => {
      expect(parseDuration('5ms')).toBe(5);
      expect(parseDuration('5us')).toBe(0.005);
      expect(parseDuration('5µs')).toBe(0.005);
      expect(parseDuration('5ns')).toBeCloseTo(0.000005, 12);
    });

    it('adds up multiple values', () => {
      expect(parseDuration('1h 30m')).toBe(HOUR + 30 * MINUTE);
      expect(parseDuration('1 d 2 h')).toBe(DAY + 2 * HOUR);
    });

    it('supports negative values, exponents and thousands separators', () => {
      expect(parseDuration('-1d')).toBe(-DAY);
      expect(parseDuration('1e3s')).toBe(1000 * SECOND);
      expect(parseDuration('1,000ms')).toBe(1000);
    });

    it('returns 0 for zero durations', () => {
      expect(parseDuration('0d')).toBe(0);
    });

    it('returns null when the input has no number with a known unit', () => {
      expect(parseDuration('')).toBeNull();
      expect(parseDuration('abc')).toBeNull();
      expect(parseDuration('1')).toBeNull();
      expect(parseDuration('1n')).toBeNull();
      expect(parseDuration('1toString')).toBeNull();
      expect(parseDuration('1constructor')).toBeNull();
    });

    it('ignores unknown units that are longer than any known unit', () => {
      expect(parseDuration(`1${'x'.repeat(100)} 2d`)).toBe(2 * DAY);
    });

    it('handles long hostile input in linear time', () => {
      const inputs = [
        `1${'0'.repeat(500)}e1${'α'.repeat(1e6)}`,
        `-1e${'-----'.repeat(2e5)}`,
        `${'....'.repeat(99)}7`.repeat(5000),
        `1${'a'.repeat(1e6)}`,
      ];

      for (const input of inputs) {
        const start = Date.now();
        parseDuration(input);
        expect(Date.now() - start).toBeLessThan(1000);
      }
    });
  });
});
