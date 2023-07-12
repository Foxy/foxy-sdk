import { getResourceId } from '../../src/core';

describe('Core', () => {
  describe('getResourceId', () => {
    it('supports numeric IDs', () => {
      expect(getResourceId('https://api.foxy.io/stores/123')).toEqual(123);
    });

    it('supports string IDs', () => {
      expect(getResourceId('https://api.foxy.io/stores/AB1')).toEqual('AB1');
    });

    it("returns null if there's no ID", () => {
      expect(getResourceId('https://api.foxy.io')).toBeNull();
    });

    it('returns null if the provided URI is invalid', () => {
      expect(getResourceId('this is definitely not a URI')).toBeNull();
    });
  });
});
