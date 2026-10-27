import * as Admin from '../../admin/index.js';
import type { APIEventMap, APIInit, GrantOpts, SignInParams, SSOURLOptions, TokenResponse, Tokens } from '../../admin/index.js';

describe('Admin', () => {
  describe('index', () => {
    it('exports the types its public signatures use', () => {
      // The real assertion is the typecheck: it fails if a type is not exported.
      const types: [APIEventMap?, APIInit?, GrantOpts?, SignInParams?, SSOURLOptions?, TokenResponse?, Tokens?] = [];
      expect(types).toHaveLength(0);
    });

    it('exports the API client', () => {
      expect(Admin).toHaveProperty('API');
    });

    it('exports the Signer functions', () => {
      expect(Admin).toHaveProperty('signName');
      expect(Admin).toHaveProperty('signValue');
      expect(Admin).toHaveProperty('signUrl');
      expect(Admin).toHaveProperty('signFragment');
      expect(Admin).toHaveProperty('cartExcludes');
      expect(Admin).toHaveProperty('cartExcludePrefixes');
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
        'AuthError',
        'InvalidFrequencyError',
        'ResolutionError',
        'Response',
        'cartExcludePrefixes',
        'cartExcludes',
        'createSSOURL',
        'getAllowedFrequencies',
        'getNextTransactionDateConstraints',
        'getResourceId',
        'getTimeFromFrequency',
        'isNextTransactionDate',
        'signFragment',
        'signName',
        'signUrl',
        'signValue',
        'verifyWebhookSignature',
      ]);
    });
  });
});
