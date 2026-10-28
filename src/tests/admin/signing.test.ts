import * as Signing from '../../admin/signing.js';

describe('Admin', () => {
  describe('signing', () => {
    it('exports exactly the four signing functions', () => {
      expect(Object.keys(Signing).sort()).toStrictEqual(['signFragment', 'signName', 'signUrl', 'signValue']);
    });
  });
});
