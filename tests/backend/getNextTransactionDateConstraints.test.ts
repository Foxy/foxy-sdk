import { getNextTransactionDateConstraints as getConstraints } from '../../src/backend';

const sampleData = {
  date_created: '2013-08-19T10:58:39-0700',
  date_modified: '2013-08-19T10:58:39-0700',
  end_date: null,
  error_message: '',
  first_failed_transaction_date: null,
  frequency: '1m',
  is_active: false,
  next_transaction_date: '2014-05-01T00:00:00-0700',
  past_due_amount: 0,
  start_date: '2010-09-15T00:00:00-0700',
  third_party_id: '',
};

describe('Backend', () => {
  describe('getNextTransactionDateConstraints', () => {
    it('returns false if rules argument is false', () => {
      expect(getConstraints(sampleData, false)).toBe(false);
    });

    it('returns false if none of the rules apply', () => {
      const rules = [{ jsonataQuery: '$contains(frequency, "d")' }, { jsonataQuery: '$contains(frequency, "d")' }];
      expect(getConstraints(sampleData, rules)).toBe(false);
    });

    it('returns true if rules argument is true', () => {
      expect(getConstraints(sampleData, true)).toBe(true);
    });

    it('picks the smallest of the applicable min properties', () => {
      const rules = [
        { jsonataQuery: '$contains(frequency, "m")', min: '4y' },
        { jsonataQuery: '$contains(frequency, "m")', min: '2w' },
        { jsonataQuery: '$contains(frequency, "d")', min: '1d' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('min', '2w');
    });

    it('picks the greatest of the applicable max properties', () => {
      const rules = [
        { jsonataQuery: '$contains(frequency, "m")', max: '2w' },
        { jsonataQuery: '$contains(frequency, "m")', max: '4m' },
        { jsonataQuery: '$contains(frequency, "d")', max: '7y' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('max', '4m');
    });

    it('combines and dedupes all applicable disallowed dates', () => {
      const rules = [
        { disallowedDates: ['2020-03-14'], jsonataQuery: '$contains(frequency, "m")' },
        { disallowedDates: ['2020-03-14', '2021-02-18'], jsonataQuery: '$contains(frequency, "m")' },
        { disallowedDates: ['2019-03-26'], jsonataQuery: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('disallowedDates', ['2020-03-14', '2021-02-18']);
    });

    it('combines and dedupes all applicable allowed days of week', () => {
      const rules = [
        { allowedDays: { days: [1], type: 'day' as const }, jsonataQuery: '$contains(frequency, "m")' },
        { allowedDays: { days: [1, 2], type: 'day' as const }, jsonataQuery: '$contains(frequency, "m")' },
        { allowedDays: { days: [3], type: 'day' as const }, jsonataQuery: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('allowedDaysOfWeek', [1, 2]);
    });

    it('combines and dedupes all applicable allowed days of month', () => {
      const rules = [
        { allowedDays: { days: [23], type: 'month' as const }, jsonataQuery: '$contains(frequency, "m")' },
        { allowedDays: { days: [23, 31], type: 'month' as const }, jsonataQuery: '$contains(frequency, "m")' },
        { allowedDays: { days: [10], type: 'month' as const }, jsonataQuery: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('allowedDaysOfMonth', [23, 31]);
    });
  });
});
