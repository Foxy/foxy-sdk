import { getNextTransactionDateConstraints as getConstraints } from '../../src/customer';

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

describe('Customer', () => {
  describe('getNextTransactionDateConstraints', () => {
    it('returns false if rules argument is false', () => {
      expect(getConstraints(sampleData, false)).toBe(false);
    });

    it('returns false if none of the rules apply', () => {
      const rules = [{ jsonata_query: '$contains(frequency, "d")' }, { jsonata_query: '$contains(frequency, "d")' }];
      expect(getConstraints(sampleData, rules)).toBe(false);
    });

    it('returns true if rules argument is true', () => {
      expect(getConstraints(sampleData, true)).toBe(true);
    });

    it('picks the smallest of the applicable min properties', () => {
      const rules = [
        { jsonata_query: '$contains(frequency, "m")', min: '4y' },
        { jsonata_query: '$contains(frequency, "m")', min: '2w' },
        { jsonata_query: '$contains(frequency, "d")', min: '1d' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('min', '2w');
    });

    it('picks the greatest of the applicable max properties', () => {
      const rules = [
        { jsonata_query: '$contains(frequency, "m")', max: '2w' },
        { jsonata_query: '$contains(frequency, "m")', max: '4m' },
        { jsonata_query: '$contains(frequency, "d")', max: '7y' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('max', '4m');
    });

    it('combines and dedupes all applicable disallowed dates', () => {
      const rules = [
        { disallowed_dates: ['2020-03-14'], jsonata_query: '$contains(frequency, "m")' },
        { disallowed_dates: ['2020-03-14', '2021-02-18'], jsonata_query: '$contains(frequency, "m")' },
        { disallowed_dates: ['2019-03-26'], jsonata_query: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('disallowedDates', ['2020-03-14', '2021-02-18']);
    });

    it('combines and dedupes all applicable allowed days of week', () => {
      const rules = [
        { allowed_days: { days: [1], type: 'day' as const }, jsonata_query: '$contains(frequency, "m")' },
        { allowed_days: { days: [1, 2], type: 'day' as const }, jsonata_query: '$contains(frequency, "m")' },
        { allowed_days: { days: [3], type: 'day' as const }, jsonata_query: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('allowedDaysOfWeek', [1, 2]);
    });

    it('combines and dedupes all applicable allowed days of month', () => {
      const rules = [
        { allowed_days: { days: [23], type: 'month' as const }, jsonata_query: '$contains(frequency, "m")' },
        { allowed_days: { days: [23, 31], type: 'month' as const }, jsonata_query: '$contains(frequency, "m")' },
        { allowed_days: { days: [10], type: 'month' as const }, jsonata_query: '$contains(frequency, "d")' },
      ];

      expect(getConstraints(sampleData, rules)).toHaveProperty('allowedDaysOfMonth', [23, 31]);
    });
  });
});
