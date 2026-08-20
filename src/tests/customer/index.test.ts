import * as Customer from '../../customer/index.js';

describe('Customer', () => {
  describe('index', () => {
    it('exports the API client', () => {
      expect(Customer).toHaveProperty('API');
    });

    it('exports PaymentCardEmbed', () => {
      expect(Customer).toHaveProperty('PaymentCardEmbed');
    });

    it('exports the gating helpers', () => {
      expect(Customer).toHaveProperty('getAllowedFrequencies');
      expect(Customer).toHaveProperty('getNextTransactionDateConstraints');
      expect(Customer).toHaveProperty('isNextTransactionDate');
      expect(Customer).toHaveProperty('getTimeFromFrequency');
    });
  });
});
