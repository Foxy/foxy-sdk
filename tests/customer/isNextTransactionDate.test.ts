/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-jsdoc */

import { CustomerPortalSettings } from '../../src/customer/Graph/customer_portal_settings';
import { isNextTransactionDate } from '../../src/customer/isNextTransactionDate';

function mockSubscription(frequency = '1m') {
  return {
    date_created: '2013-08-19T10:58:39-0700',
    date_modified: '2013-08-19T10:58:39-0700',
    end_date: null,
    error_message: '',
    first_failed_transaction_date: null,
    frequency,
    is_active: false,
    next_transaction_date: '2014-05-01T00:00:00-0700',
    past_due_amount: 0,
    start_date: '2010-09-15T00:00:00-0700',
    third_party_id: '',
  };
}

type Config = CustomerPortalSettings['props']['subscriptions']['allow_next_date_modification'];

function mockSettings(rules: Config) {
  return { subscriptions: { allow_next_date_modification: rules } };
}

describe('Customer', () => {
  describe('isNextTransactionDate', () => {
    it('returns true if allow_next_date_modification is true', () => {
      const result = isNextTransactionDate({
        settings: mockSettings(true),
        subscription: mockSubscription(),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it('returns false if allow_next_date_modification is false', () => {
      const result = isNextTransactionDate({
        settings: mockSettings(false),
        subscription: mockSubscription(),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns false if none of the rules match', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonata_query: '$contains(frequency, "2y")' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if none of the disallowed_dates match', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowed_dates: ['2021-01-01'], jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it('returns false if one of the disallowed_dates matches', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowed_dates: ['2020-01-01'], jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns false if one of the ranges in disallowed_dates includes given date', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowed_dates: ['2019-01-01..2021-01-01'], jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if day of month matches one in allowed_days', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowed_days: { days: [1], type: 'month' }, jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it("returns false if day of month doesn't match any in allowed_days", () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowed_days: { days: [2], type: 'month' }, jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if day of week matches one in allowed_days', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowed_days: { days: [3], type: 'day' }, jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it("returns false if day of week doesn't match any in allowed_days", () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowed_days: { days: [1], type: 'day' }, jsonata_query: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if given date is later than min', () => {
      const value = new Date(new Date().getFullYear() + 1, 0, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonata_query: '*', min: '1m' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(true);
    });

    it('returns false if given date is earlier than min', () => {
      const value = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonata_query: '*', min: '1y' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(false);
    });

    it('returns true if given date is earlier than max', () => {
      const value = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonata_query: '*', max: '1y' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(true);
    });

    it('returns false if given date is later than max', () => {
      const value = new Date(new Date().getFullYear() + 1, 0, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonata_query: '*', max: '1m' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(false);
    });
  });
});
