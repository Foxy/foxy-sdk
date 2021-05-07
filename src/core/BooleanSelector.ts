const enum Entity {
  List,
  Set,
}

type Tree = { only?: Record<string, Tree>; not?: string[] };
type Output = { entity: Entity; buffer: string; tree: Tree; branch: Tree | string[] };
type Processor = (output: Output, character: string) => void;

/**
 * Boolean selector is an HTML boolean attribute value format that allows
 * developers to write configurations for elements deep in a shadow DOM. Here's
 * what it looks like:
 *
 * ```text
 * direct-child-one:nested-child:not=descendant-one,descendant-two direct-child-two
 * ```
 *
 * When used with the "disabled" attribute, the code above could translate to: "Disable
 * everything except for the descendant-one and descendant-two in the nested-child that
 * belongs to direct-child-one; disable direct-child-two entirely."
 *
 * Boolean selector is always a list, where items are separated by whitespace (as much
 * as you need, including line breaks):
 *
 * ```text
 * item-one item-two item-three
 * ```
 *
 * Each item is a path that consists of identifiers (lowercase characters from a to z or a dash)
 * separated by a colon:
 *
 * ```text
 * parent:child:nested-child
 * ```
 *
 * By default, only specified paths will be selected. To select everything except for certain paths,
 * add the `not=` modifier to the end of the path (or at the top level):
 *
 * ```text
 * parent:child:not=exception
 * ```
 *
 * You can specify multiple values by separating them with a comma and optionally a whitespace:
 *
 * ```text
 * parent:child:not=exception-one, exception-two
 * ```
 *
 * Only lowercase a-z letters, colon, comma, dash and whitespace are allowed in the selectors. An attempt
 * to use a character outside of this set will result in a `SyntaxError`.
 */
export class BooleanSelector {
  /**
   * Helper selector that matches any identifier on any level.
   *
   * @example
   * BooleanSelector.True.matches('anything') // => true
   * BooleanSelector.True.zoom('thing').matches('stuff') // => true
   *
   * @returns `BooleanSelector` singleton
   */
  static get True(): BooleanSelector {
    return trueBooleanSelectorSingleton;
  }

  /**
   * Helper selector that doesn't match any identifier on any level.
   *
   * @example
   * BooleanSelector.False.matches('anything') // => false
   * BooleanSelector.False.zoom('thing').matches('stuff') // => false
   *
   * @returns `BooleanSelector` singleton
   */
  static get False(): BooleanSelector {
    return falseBooleanSelectorSingleton;
  }

  /**
   * Creates a `BooleanSelector` instance from an attribute value according to the following rules:
   *
   * - null will be parsed as empty string;
   * - empty string or `truthyValue` will be parsed as `:not=*` ;
   * - in every other case attribute value will be parsed as regular boolean selector.
   *
   * @example
   * const value = element.getAttribute('disabled');
   * BooleanSelector.fromAttribute(value) // => [object BooleanSelector]
   *
   * @param value attribite value
   * @param truthyValue additional attribute value that must be treated as truthy (use attribute name here to be spec-compliant)
   * @returns `BooleanSelector` instance constructed from the given attribite value
   */
  static fromAttribute(value: string | null, truthyValue?: string): BooleanSelector {
    if (value === null) return BooleanSelector.False;
    if (value === '' || value === truthyValue) return BooleanSelector.True;
    return new BooleanSelector(value);
  }

  private static __processors: Record<Entity, Processor> = {
    [Entity.List](output, character) {
      /* istanbul ignore next */
      if (Array.isArray(output.branch)) throw new SyntaxError('Paths are not allowed in sets.');

      if (character === '=') {
        if (output.buffer === 'not') {
          const newBranch = output.branch.not ?? [];

          output.branch.not = newBranch;
          output.entity = Entity.Set;
          output.branch = newBranch;
          output.buffer = '';

          return;
        } else {
          throw new SyntaxError(`Unknown modifier "${output.buffer}".`);
        }
      }

      if (/^\s$/.test(character) || character === ':') {
        if (output.buffer.length > 0) {
          const selector = output.buffer;
          const newBranch = output.branch.only?.[selector] ?? { not: ['*'] };

          output.branch.only = { ...output.branch.only, [selector]: newBranch };
          output.branch = /^\s$/.test(character) ? output.tree : newBranch;
          output.buffer = '';
        }

        return;
      }

      if (/^[a-z]|-$/.test(character)) {
        output.buffer += character;
        return;
      }

      throw new SyntaxError(`Expected [a-z], "-", ":" or a whitespace, but got "${character}" instead.`);
    },

    [Entity.Set](output, character) {
      /* istanbul ignore next */
      if (!Array.isArray(output.branch)) throw new SyntaxError('Unexpected set item.');

      if (output.buffer.length === 0 && /^\s$/.test(character)) return;

      if (character === ',' || character === '*' || /^\s$/.test(character)) {
        const updatedSet = character === '*' ? ['*'] : [...output.branch.filter(v => v !== '*'), output.buffer];
        output.branch.splice(0, output.branch.length, ...updatedSet);

        output.entity = character === ',' ? Entity.Set : Entity.List;
        output.branch = character === ',' ? output.branch : output.tree;
        output.buffer = '';

        return;
      }

      if (/^[a-z]|-$/.test(character)) {
        output.buffer += character;
        return;
      }

      throw new SyntaxError(`Expected [a-z], "-", "," or a whitespace, but got "${character}" instead.`);
    },
  };

  private __value: string;

  private __tree: Tree;

  /**
   * Parses the boolean selector value and creates an instance
   * of the `BooleanSelector` class.
   *
   * @param value boolean selector value, e.g. `foo:bar baz:not=qux`
   */
  constructor(value: string) {
    this.__value = value;
    this.__tree = BooleanSelector.__parse(value);
  }

  /**
   * Checks if current selector includes rules for the given top-level identifier.
   *
   * @example
   * new BooleanSelector('foo').matches('foo') // => true
   * new BooleanSelector('foo').matches('foo', true) // => true
   * new BooleanSelector('foo').matches('bar') // => false
   * new BooleanSelector('foo:bar').matches('foo') // => true
   * new BooleanSelector('foo:bar').matches('foo', true) // => false
   * new BooleanSelector('foo:bar').matches('bar') // => false
   *
   * @param id identifier to look for
   * @param [isFullMatch=false] if true, will match only if the entire namespace is selected
   * @returns `true` is current selector includes rules for the given identifier
   */
  matches(id: string, isFullMatch = false): boolean {
    const selector = this.zoom(id).toString();
    return isFullMatch ? selector === 'not=*' : selector !== '';
  }

  /**
   * Zooms on the given top-level identifier.
   *
   * @example
   * new BooleanSelector('foo:bar:baz').zoom('foo').toString() // => "bar:baz"
   * new BooleanSelector('not=foo').zoom('bar').toString() // => "not=*"
   * new BooleanSelector('not=foo').zoom('foo').toString() // => ""
   *
   * @param id identifier to look for
   * @returns `true` is current selector includes rules for the given identifier
   */
  zoom(id: string): BooleanSelector {
    const { only, not } = this.__tree;
    if (only?.[id]) return new BooleanSelector(BooleanSelector.__stringify(only[id]));
    if (!not || not.includes(id)) return BooleanSelector.False;
    return BooleanSelector.True;
  }

  /**
   * Converts this selector to string.
   *
   * @example
   * new BooleanSelector('foo:bar').toString() // => "foo:bar"
   *
   * @returns serialized representation of this selector
   */
  toString(): string {
    return this.__value;
  }

  /**
   * Converts this selector to an attribute value.
   *
   * @example
   * new BooleanSelector('foo:bar').toAttribute() // => "foo:bar"
   * BooleanSelector.False.toAttribute() // => null
   * BooleanSelector.True.toAttribute("disabled") // => "disabled"
   * BooleanSelector.True.toAttribute() // => ""
   *
   * @param truthyValue attribute value for wildcard selectors (use attribute name here to be spec-compliant)
   * @returns attribute value representing this selector.
   */
  toAttribute(truthyValue = ''): string | null {
    if (this.__tree.not?.[0] === '*') return truthyValue;
    return this.__value.trim().length === 0 ? null : this.toString();
  }

  private static __stringify(tree: Tree, path = ''): string {
    if (tree.only) {
      return Object.entries(tree.only).reduce((output, [key, subtree]) => {
        const result = BooleanSelector.__stringify(subtree, path.length === 0 ? key : `${path}:${key}`);
        return output.length === 0 ? result : `${output} ${result}`;
      }, '');
    }

    if (tree.not) return `${path.length === 0 ? '' : `${path}:`}not=${tree.not.join(',')}`;

    return path;
  }

  private static __parse(value: string): Tree {
    const tree = {};
    const output: Output = { branch: tree, buffer: '', entity: Entity.List, tree };

    Array.from(`${value} `).forEach((character, position) => {
      try {
        BooleanSelector.__processors[output.entity](output, character);
      } catch (err) {
        const hint = 'This error occured at: ';
        const trim = (v: string) => v.substring(Math.max(0, position - 30), position + 30);
        const preview = trim(value);
        const pointer = ' '.repeat(hint.length) + trim('^'.padStart(position + 1, ' '));

        throw new SyntaxError([err.message, `${hint}${preview}`, pointer].join('\n'));
      }
    });

    return tree;
  }
}

const falseBooleanSelectorSingleton = new BooleanSelector('');
const trueBooleanSelectorSingleton = new BooleanSelector('not=*');
