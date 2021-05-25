/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-jsdoc */

import { CustomerPortalSettings } from '../../src/customer/Graph/customer_portal_settings';
import { getAllowedFrequencies } from '../../src/customer/getAllowedFrequencies';

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

type Rules = CustomerPortalSettings['props']['subscriptions']['allow_frequency_modification'];

function mockSettings(rules: Rules = []) {
  return { subscriptions: { allow_frequency_modification: rules } };
}

describe('Customer', () => {
  describe('getAllowedFrequencies', () => {
    it('returns empty array for empty ruleset', () => {
      const result = getAllowedFrequencies({
        settings: mockSettings(),
        subscription: mockSubscription(),
      });

      expect([...result]).toHaveLength(0);
    });

    it('returns frequencies from matched ruleset', () => {
      const rules = [
        { jsonata_query: '$contains(frequency, "1m")', values: ['1m', '2m', '3m'] },
        { jsonata_query: '$contains(frequency, "1y")', values: ['1y'] },
      ];

      const result = getAllowedFrequencies({
        settings: mockSettings(rules),
        subscription: mockSubscription('1m'),
      });

      expect([...result]).toEqual(['1m', '2m', '3m']);
    });

    it('returns only unique frequency values from all matched rulesets', () => {
      const rules = [
        { jsonata_query: '$contains(frequency, "1m")', values: ['1m', '2m'] },
        { jsonata_query: '*', values: ['1m', '3m'] },
      ];

      const result = getAllowedFrequencies({
        settings: mockSettings(rules),
        subscription: mockSubscription('1m'),
      });

      expect([...result]).toEqual(['1m', '2m', '3m']);
    });
  });
});
