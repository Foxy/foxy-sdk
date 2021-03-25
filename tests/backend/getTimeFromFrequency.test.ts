import { InvalidFrequencyError, getTimeFromFrequency } from '../../src/backend';

describe('Backend', () => {
  describe('getTimeFromFrequency', () => {
    it('throws InvalidFrequencyError for invalid input', () => {
      expect(() => getTimeFromFrequency('-3n')).toThrow(InvalidFrequencyError);
    });

    it('supports special twice a month value (.5m)', () => {
      expect(getTimeFromFrequency('.5m')).toBe(1339200000);
    });

    it('supports day values (d)', () => {
      expect(getTimeFromFrequency('1d')).toBe(86400000);
      expect(getTimeFromFrequency('2d')).toBe(86400000 * 2);
    });

    it('supports week values (w)', () => {
      expect(getTimeFromFrequency('1w')).toBe(604800000);
      expect(getTimeFromFrequency('4w')).toBe(604800000 * 4);
    });

    it('supports month values (m)', () => {
      expect(getTimeFromFrequency('1m')).toBe(2678400000);
      expect(getTimeFromFrequency('6m')).toBe(2678400000 * 6);
    });

    it('supports year values (y)', () => {
      expect(getTimeFromFrequency('1y')).toBe(31536000000);
      expect(getTimeFromFrequency('8y')).toBe(31536000000 * 8);
    });
  });
});
