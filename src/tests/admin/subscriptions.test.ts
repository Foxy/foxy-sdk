import * as Subscriptions from '../../admin/subscriptions.js';

describe('Admin', () => {
  describe('subscriptions', () => {
    it('exports exactly the subscription rules', () => {
      expect(Object.keys(Subscriptions).sort()).toStrictEqual([
        'InvalidFrequencyError',
        'getAllowedFrequencies',
        'getNextTransactionDateConstraints',
        'getTimeFromFrequency',
        'isNextTransactionDate',
      ]);
    });

    it('exports the error getTimeFromFrequency throws', () => {
      expect(() => Subscriptions.getTimeFromFrequency('3x')).toThrow(Subscriptions.InvalidFrequencyError);
    });
  });
});
