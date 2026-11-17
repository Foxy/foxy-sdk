import { ArgumentError, checkArgument, v8n } from '../../src/core/v8n';

import { inspect } from 'util';

describe('Core', () => {
  describe('checkArgument', () => {
    const validator = v8n().schema({
      level: v8n().optional(v8n().integer()),
      nested: v8n().optional(v8n().schema({ count: v8n().number() })),
      secret: v8n().string(),
    });

    it('does nothing when the value is valid', () => {
      expect(() => checkArgument(validator, { secret: 'abc' }, 'params')).not.toThrow();
    });

    it('throws ArgumentError naming every failing field and rule', () => {
      let error: unknown;

      try {
        checkArgument(validator, { level: 'error', nested: { count: 'x' }, secret: 'top-secret-value' }, 'params');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(ArgumentError);
      expect(error).toBeInstanceOf(TypeError);
      expect((error as ArgumentError).failures).toEqual([
        { field: 'params.level', rule: 'integer' },
        { field: 'params.nested.count', rule: 'number' },
      ]);

      expect((error as Error).message).toBe('Invalid argument: params.level (integer), params.nested.count (number)');
    });

    it('keeps argument values out of the error', () => {
      let error: unknown;

      try {
        checkArgument(validator, { level: 'error', secret: 'top-secret-value' }, 'params');
      } catch (err) {
        error = err;
      }

      const output = inspect(error, { depth: null, showHidden: true });
      expect(output).not.toContain('top-secret-value');
      expect(output).not.toContain("'error'");
      expect(error).not.toHaveProperty('value');
      expect(error).not.toHaveProperty('cause');
    });

    it('names the argument itself when a non-object value fails', () => {
      expect(() => checkArgument(v8n().string(), 42, 'email')).toThrow('Invalid argument: email (string)');
    });

    it('includes rule modifiers in the rule name', () => {
      expect(() => checkArgument(v8n().not.string(), 'secret-value', 'value')).toThrow(
        'Invalid argument: value (not.string)'
      );
    });
  });
});
