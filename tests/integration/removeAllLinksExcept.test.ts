import traverse, { TraverseContext } from 'traverse';

import { removeAllLinksExcept } from '../../src/integration/removeAllLinksExcept';

describe('Integration', () => {
  describe('removeAllLinksExcept', () => {
    it('errors when invoked without traverse context', () => {
      const incorrectContext = (null as unknown) as TraverseContext;
      expect(() => removeAllLinksExcept().call(incorrectContext)).toThrow();
    });

    it('errors when invoked with incorrect arguments', () => {
      const incorrectArgs = ([0, null, {}] as unknown) as Parameters<typeof removeAllLinksExcept>;
      expect(() => traverse({}).map(removeAllLinksExcept(...incorrectArgs))).toThrow();
    });

    it('removes all links except for given', () => {
      const input = {
        _links: {
          'fx:attributes': { href: 'https://api.foxy.test/stores/0/attributes' },
          'fx:customer': { href: 'https://api.foxy.test/customers/0' },
          'fx:user': { href: 'https://api.foxy.test/users/0' },
        },
      };

      const output = {
        _links: {
          'fx:customer': { href: 'https://api.foxy.test/customers/0' },
        },
      };

      expect(traverse(input).map(removeAllLinksExcept('fx:customer'))).toEqual(output);
    });
  });
});
