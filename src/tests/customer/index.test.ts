import * as Customer from '../../customer/index.js';

describe('Customer', () => {
  describe('index', () => {
    it('exports the API client', () => {
      expect(Customer).toHaveProperty('API');
    });

    it('exports PaymentCardEmbed', () => {
      expect(Customer).toHaveProperty('PaymentCardEmbed');
    });

    it('exports exactly the documented surface and nothing more', () => {
      expect(Object.keys(Customer).sort()).toStrictEqual([
        'API',
        'AuthError',
        'PaymentCardEmbed',
        'ResolutionError',
        'Response',
        'getResourceId',
      ]);
    });
  });
});
