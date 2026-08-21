import * as Admin from '../../admin/index.js';

describe('Admin', () => {
  describe('index', () => {
    it('exports the API client', () => {
      expect(Admin).toHaveProperty('API');
    });

    it('exports the Signer utility', () => {
      expect(Admin).toHaveProperty('Signer');
    });

    it('exports createSSOURL', () => {
      expect(Admin).toHaveProperty('createSSOURL');
    });

    it('exports verifyWebhookSignature', () => {
      expect(Admin).toHaveProperty('verifyWebhookSignature');
    });

    it('exports the gating helpers', () => {
      expect(Admin).toHaveProperty('getAllowedFrequencies');
      expect(Admin).toHaveProperty('getNextTransactionDateConstraints');
      expect(Admin).toHaveProperty('getTimeFromFrequency');
      expect(Admin).toHaveProperty('InvalidFrequencyError');
      expect(Admin).toHaveProperty('isNextTransactionDate');
    });

    it('exports exactly the documented surface and nothing more', () => {
      expect(Object.keys(Admin).sort()).toStrictEqual([
        'API',
        'InvalidFrequencyError',
        'Signer',
        'createSSOURL',
        'getAllowedFrequencies',
        'getNextTransactionDateConstraints',
        'getTimeFromFrequency',
        'isNextTransactionDate',
        'verifyWebhookSignature',
      ]);
    });
  });
});
