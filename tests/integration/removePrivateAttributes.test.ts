import traverse, { TraverseContext } from 'traverse';

import { removePrivateAttributes } from '../../src/integration/removePrivateAttributes';

describe('Integration', () => {
  describe('removePrivateAttributes', () => {
    it('errors when invoked without traverse context', () => {
      const incorrectContext = (null as unknown) as TraverseContext;
      expect(() => removePrivateAttributes.call(incorrectContext, null)).toThrow();
    });

    it('removes private attributes', () => {
      const input = {
        _embedded: {
          'fx:attributes': [
            { name: 'foo', visibility: 'private' },
            { name: 'bar', visibility: 'public' },
            undefined,
            null,
            0,
            'hi',
          ],
        },
        _links: {
          'fx:attributes': { href: '' },
        },
      };

      const output = {
        _embedded: {
          'fx:attributes': [{ name: 'bar', visibility: 'public' }, undefined, null, 0, 'hi'],
        },
        _links: {
          'fx:attributes': { href: '' },
        },
      };

      expect(traverse(input).map(removePrivateAttributes)).toEqual(output);
    });
  });
});
