import traverse, { TraverseContext } from 'traverse';

import { removeSensitiveData } from '../../src/integration/removeSensitiveData';

describe('Integration', () => {
  describe('removeSensitiveData', () => {
    it('errors when invoked without traverse context', () => {
      const incorrectContext = (null as unknown) as TraverseContext;
      expect(() => removeSensitiveData.call(incorrectContext)).toThrow();
    });

    it('removes sensitive data from record', () => {
      const input = {
        bar: 1,
        foo: {
          baz: [],
          password_hash: 'so secret',
          third_party_id: 1,
        },
        password: 'one-time code',
      };

      const output = {
        bar: 1,
        foo: {
          baz: [],
        },
      };

      expect(traverse(input).map(removeSensitiveData)).toEqual(output);
    });
  });
});
