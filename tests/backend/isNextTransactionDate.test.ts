/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-jsdoc */

import { CustomerPortalSettings } from '../../src/backend/Graph/customer_portal_settings';
import { isNextTransactionDate } from '../../src/backend/isNextTransactionDate';

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
    payment_type: 'plastic' as const,
    start_date: '2010-09-15T00:00:00-0700',
    third_party_id: '',
  };
}

type Config = CustomerPortalSettings['props']['subscriptions']['allowNextDateModification'];

function mockSettings(rules: Config) {
  return { subscriptions: { allowNextDateModification: rules } };
}

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n: number) => `0${n}`.slice(-2);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

describe('Backend', () => {
  describe('isNextTransactionDate', () => {
    it('returns true if allowNextDateModification is true', () => {
      const result = isNextTransactionDate({
        settings: mockSettings(true),
        subscription: mockSubscription(),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it('returns false if allowNextDateModification is false', () => {
      const result = isNextTransactionDate({
        settings: mockSettings(false),
        subscription: mockSubscription(),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns false if none of the rules match', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonataQuery: '$contains(frequency, "2y")' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if none of the disallowedDates match', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowedDates: ['2021-01-01'], jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it('returns false if one of the disallowedDates matches', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowedDates: ['2020-01-01'], jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns false if one of the ranges in disallowedDates includes given date', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ disallowedDates: ['2019-01-01..2021-01-01'], jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if day of month matches one in allowedDays', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowedDays: { days: [1], type: 'month' }, jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it("returns false if day of month doesn't match any in allowedDays", () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowedDays: { days: [2], type: 'month' }, jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if day of week matches one in allowedDays', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowedDays: { days: [3], type: 'day' }, jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(true);
    });

    it("returns false if day of week doesn't match any in allowedDays", () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ allowedDays: { days: [1], type: 'day' }, jsonataQuery: '*' }]),
        subscription: mockSubscription('1m'),
        value: '2020-01-01',
      });

      expect(result).toBe(false);
    });

    it('returns true if given date is later than min', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonataQuery: '*', min: '1m' }]),
        subscription: mockSubscription('1m'),
        value: inDays(60),
      });

      expect(result).toBe(true);
    });

    it('returns false if given date is earlier than min', () => {
      const value = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonataQuery: '*', min: '1y' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(false);
    });

    it('returns true if given date is earlier than max', () => {
      const value = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonataQuery: '*', max: '1y' }]),
        subscription: mockSubscription('1m'),
        value: value.toISOString().substring(0, 10),
      });

      expect(result).toBe(true);
    });

    it('returns false if given date is later than max', () => {
      const result = isNextTransactionDate({
        settings: mockSettings([{ jsonataQuery: '*', max: '1m' }]),
        subscription: mockSubscription('1m'),
        value: inDays(60),
      });

      expect(result).toBe(false);
    });

    it('supports weeks, days and months in min and max', () => {
      const check = (rule: { min?: string; max?: string }, days: number) =>
        isNextTransactionDate({
          settings: mockSettings([{ jsonataQuery: '*', ...rule }]),
          subscription: mockSubscription('1m'),
          value: inDays(days),
        });

      expect(check({ min: '2w' }, 7)).toBe(false);
      expect(check({ min: '2w' }, 30)).toBe(true);
      expect(check({ min: '10d' }, 5)).toBe(false);
      expect(check({ min: '10d' }, 15)).toBe(true);
      expect(check({ max: '2w' }, 7)).toBe(true);
      expect(check({ max: '2w' }, 30)).toBe(false);
      expect(check({ max: '10d' }, 5)).toBe(true);
      expect(check({ max: '10d' }, 15)).toBe(false);
      expect(check({ min: '1m' }, 7)).toBe(false);
      expect(check({ min: '1m' }, 45)).toBe(true);
      expect(check({ min: '.5m' }, 7)).toBe(false);
      expect(check({ max: '1m' }, 7)).toBe(true);
      expect(check({ max: '1m' }, 45)).toBe(false);
    });
  });
});
