/* eslint-disable sort-keys */

import { BooleanSelector } from '../../src/core';

describe('Core', () => {
  describe('BooleanSelector', () => {
    it('supports empty lists', () => {
      const selector = new BooleanSelector('not=bar');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);
    });

    it('supports wildcards in not= modifier', () => {
      const selector = new BooleanSelector('not=*');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(true);
    });

    it('supports simple lists with not= modifier', () => {
      const selector = new BooleanSelector('not=bar');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);
    });

    it('supports simple lists with simple items', () => {
      const selector = new BooleanSelector('foo');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);
    });

    it('supports simple lists with complex items', () => {
      const selector = new BooleanSelector('foo:bar');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);

      expect(selector.zoom('foo').matches('bar')).toBe(true);
      expect(selector.zoom('foo').matches('baz')).toBe(false);
    });

    it('supports simple lists with complex items and not= modifier', () => {
      const selector = new BooleanSelector('foo:not=bar');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);

      expect(selector.zoom('foo').matches('bar')).toBe(false);
      expect(selector.zoom('foo').matches('baz')).toBe(true);
    });

    it('supports complex lists with complex items and complex not= modifier', () => {
      const selector = new BooleanSelector('foo:not=bar,baz qux');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(false);
      expect(selector.matches('baz')).toBe(false);
      expect(selector.matches('qux')).toBe(true);

      expect(selector.zoom('foo').matches('bar')).toBe(false);
      expect(selector.zoom('foo').matches('baz')).toBe(false);
      expect(selector.zoom('foo').matches('any')).toBe(true);
    });

    it('supports complex ids in .zoom()', () => {
      const selector = new BooleanSelector('foo:bar:baz:qux');

      expect(selector.zoom('foo:bar').toString()).toBe('baz:qux:not=*');
      expect(selector.zoom('baz:qux').toString()).toBe('');
    });

    it('matches only complete namespaces if isFullMatch is true', () => {
      const selector = new BooleanSelector('foo:not=bar,baz qux');

      expect(selector.matches('foo', true)).toBe(false);
      expect(selector.matches('qux', true)).toBe(true);
    });

    it('throws on invalid list syntax', () => {
      expect(() => new BooleanSelector('ага')).toThrow(SyntaxError);
    });

    it('throws on unknown modifier', () => {
      expect(() => new BooleanSelector('foo:baz=qux')).toThrow(SyntaxError);
    });

    it('throws on invalid set syntax', () => {
      expect(() => new BooleanSelector('not=crêpe')).toThrow(SyntaxError);
    });

    it('outputs original input string from .toString()', () => {
      const input = 'foo:not=bar,baz qux';
      expect(new BooleanSelector(input).toString()).toBe(input);
    });

    it('outputs generated input string from .toString()', () => {
      const input = 'foo:bar:not=baz,qux quux';
      const res = 'bar:not=baz,qux';
      expect(new BooleanSelector(input).zoom('foo').toString()).toBe(res);
    });

    it('outputs null from .toAttribute() for empty selectors', () => {
      expect(new BooleanSelector('').toAttribute()).toBeNull();
    });

    it('outputs original input from .toAttribute() for non-empty selectors', () => {
      const input = 'foo:bar:not=baz,qux quux';
      expect(new BooleanSelector(input).toAttribute()).toBe(input);
    });

    it('tolerates excessive use of whitespace in lists', () => {
      const selector = new BooleanSelector('  foo   bar ');

      expect(selector.matches('foo')).toBe(true);
      expect(selector.matches('bar')).toBe(true);
      expect(selector.matches('baz')).toBe(false);
    });

    it('tolerates excessive use of whitespace in sets', () => {
      const selector = new BooleanSelector(' not=foo,    bar ');

      expect(selector.matches('foo')).toBe(false);
      expect(selector.matches('bar')).toBe(false);
      expect(selector.matches('baz')).toBe(true);
    });

    it('merges lists together', () => {
      const selector = new BooleanSelector('foo:bar foo:baz');

      expect(selector.zoom('foo').matches('bar')).toBe(true);
      expect(selector.zoom('foo').matches('baz')).toBe(true);
      expect(selector.zoom('foo').matches('qux')).toBe(false);
    });

    it('merges sets together', () => {
      const selector = new BooleanSelector('not=bar not=baz');

      expect(selector.matches('bar')).toBe(false);
      expect(selector.matches('baz')).toBe(false);
      expect(selector.matches('qux')).toBe(true);
    });

    it('prefers wildcard over detailed rules in sets', () => {
      ['not=foo not=*', 'not=* not=foo'].forEach(value => {
        const selector = new BooleanSelector(value);
        expect(selector.matches('foo')).toBe(true);
        expect(selector.matches('bar')).toBe(true);
      });
    });

    it('prefers larger namespace over detailed rules in lists', () => {
      ['foo foo:bar'].forEach(value => {
        const selector = new BooleanSelector(value);
        expect(selector.matches('foo', true)).toBe(true);
      });
    });

    it('has static property True exposing wildcard selector', () => {
      expect(BooleanSelector.True.matches('foo')).toBe(true);
      expect(BooleanSelector.True.zoom('foo').matches('bar')).toBe(true);
      expect(BooleanSelector.True.toAttribute()).toBe('');
    });

    it('has static property False exposing inverse wildcard selector', () => {
      expect(BooleanSelector.False.matches('foo')).toBe(false);
      expect(BooleanSelector.False.zoom('foo').matches('bar')).toBe(false);
      expect(BooleanSelector.False.toAttribute()).toBeNull();
    });

    it('returns BooleanSelector.False from BooleanSelector.fromAttribute if value is null', () => {
      expect(BooleanSelector.fromAttribute(null)).toBe(BooleanSelector.False);
    });

    it('returns BooleanSelector.True from BooleanSelector.fromAttribute if value is empty string', () => {
      expect(BooleanSelector.fromAttribute('')).toBe(BooleanSelector.True);
    });

    it('returns BooleanSelector.True from BooleanSelector.fromAttribute if value is custom truthy value', () => {
      expect(BooleanSelector.fromAttribute('readonly', 'readonly')).toBe(BooleanSelector.True);
      expect(BooleanSelector.fromAttribute('readonly', 'disabled')).not.toBe(BooleanSelector.True);
    });

    it('returns BooleanSelector instance from BooleanSelector.fromAttribute for custom input', () => {
      const input = 'foo:bar baz:not=qux';
      const instance = BooleanSelector.fromAttribute(input);

      expect(instance).toBeInstanceOf(BooleanSelector);
      expect(instance.toString()).toBe(input);
    });
  });
});
