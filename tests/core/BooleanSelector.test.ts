/* eslint-disable sort-keys */

import { BooleanSelector } from '../../src/core';

describe('Core', () => {
  describe('BooleanSelector', () => {
    it('supports empty lists', () => {
      const selector = new BooleanSelector('not=bar');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);
    });

    it('supports simple lists with not= modifier', () => {
      const selector = new BooleanSelector('not=bar');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);
    });

    it('supports simple lists with simple items', () => {
      const selector = new BooleanSelector('foo');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);
    });

    it('supports simple lists with complex items', () => {
      const selector = new BooleanSelector('foo:bar');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);

      expect(selector.filter('foo').allows('bar')).toBe(true);
      expect(selector.filter('foo').allows('baz')).toBe(false);
    });

    it('supports simple lists with complex items and not= modifier', () => {
      const selector = new BooleanSelector('foo:not=bar');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);

      expect(selector.filter('foo').allows('bar')).toBe(false);
      expect(selector.filter('foo').allows('baz')).toBe(true);
    });

    it('supports complex lists with complex items and complex not= modifier', () => {
      const selector = new BooleanSelector('foo:not=bar,baz qux');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(false);
      expect(selector.allows('baz')).toBe(false);
      expect(selector.allows('qux')).toBe(true);

      expect(selector.filter('foo').allows('bar')).toBe(false);
      expect(selector.filter('foo').allows('baz')).toBe(false);
      expect(selector.filter('foo').allows('any')).toBe(true);
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
      expect(new BooleanSelector(input).filter('foo').toString()).toBe(res);
    });

    it('tolerates excessive use of whitespace in lists', () => {
      const selector = new BooleanSelector('  foo   bar ');

      expect(selector.allows('foo')).toBe(true);
      expect(selector.allows('bar')).toBe(true);
      expect(selector.allows('baz')).toBe(false);
    });

    it('tolerates excessive use of whitespace in sets', () => {
      const selector = new BooleanSelector(' not=foo,    bar ');

      expect(selector.allows('foo')).toBe(false);
      expect(selector.allows('bar')).toBe(false);
      expect(selector.allows('baz')).toBe(true);
    });

    it('merges lists together', () => {
      const selector = new BooleanSelector('foo:bar foo:baz');

      expect(selector.filter('foo').allows('bar')).toBe(true);
      expect(selector.filter('foo').allows('baz')).toBe(true);
      expect(selector.filter('foo').allows('qux')).toBe(false);
    });

    it('merges sets together', () => {
      const selector = new BooleanSelector('not=bar not=baz');

      expect(selector.allows('bar')).toBe(false);
      expect(selector.allows('baz')).toBe(false);
      expect(selector.allows('qux')).toBe(true);
    });
  });
});
