import traverse, { TraverseContext } from 'traverse';

import { removeProperties } from '../../src/integration/removeProperties';

describe('Integration', () => {
  describe('removeProperties', () => {
    it('errors when invoked without traverse context', () => {
      const incorrectContext = (null as unknown) as TraverseContext;
      expect(() => removeProperties().call(incorrectContext)).toThrow();
    });

    it('errors when invoked with incorrect arguments', () => {
      const incorrectArgs = ([0, null, {}] as unknown) as Parameters<typeof removeProperties>;
      expect(() => traverse({}).map(removeProperties(...incorrectArgs))).toThrow();
    });

    it('removes given properties', () => {
      const input = { bar: { baz: ['qux'] }, foo: 0 };
      const output = { bar: {} };

      expect(traverse(input).map(removeProperties('foo', 'baz'))).toEqual(output);
    });
  });
});
