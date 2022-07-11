type Tree = { include: Record<string, Tree | true> } | { exclude: Record<string, Tree | true> };

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

  private __tree: Tree;

  /**
   * Parses the boolean selector value and creates an instance
   * of the `BooleanSelector` class.
   *
   * @param value boolean selector value, e.g. `foo:bar baz:not=qux`
   */
  constructor(value: string) {
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
   * Zooms on the given top-level identifier or follows a path.
   *
   * @example
   * new BooleanSelector('foo:bar:baz').zoom('foo:bar').toString() // => "baz"
   * new BooleanSelector('foo:bar:baz').zoom('foo').toString() // => "bar:baz"
   * new BooleanSelector('not=foo').zoom('bar').toString() // => "not=*"
   * new BooleanSelector('not=foo').zoom('foo').toString() // => ""
   *
   * @param path path to look for
   * @returns zoomed BooleanSelector
   */
  zoom(path: string): BooleanSelector {
    const zoomedSelector = new BooleanSelector('');

    zoomedSelector.__tree = path.split(':').reduce<Tree>((currentTree, id) => {
      let zoomedTree: true | Tree;

      if ('include' in currentTree) {
        zoomedTree = currentTree.include[id];
        if (zoomedTree === undefined) return { include: {} };
        if (zoomedTree === true) return { exclude: { '*': true } };
      } else {
        zoomedTree = currentTree.exclude[id];
        if (zoomedTree === undefined) return { exclude: { '*': true } };
        if (zoomedTree === true) return { include: {} };
      }

      return zoomedTree;
    }, this.__tree);

    return zoomedSelector;
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
    return BooleanSelector.__stringifyTree(this.__tree);
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
    const serializedSelector = this.toString();
    if (serializedSelector === 'not=*') return truthyValue;
    return serializedSelector.length === 0 ? null : serializedSelector;
  }

  private static __parsePath(path: string, tree: Tree): Tree {
    const firstSeparatorIndex = path.indexOf(':');
    const topLevelId = path.substring(0, firstSeparatorIndex);
    const nestedPath = path.substring(firstSeparatorIndex + 1);

    if ('exclude' in tree) {
      const subTree = tree.exclude[topLevelId];
      if (subTree) tree.exclude[topLevelId] = this.__parseListItem(nestedPath, subTree === true ? void 0 : subTree);
    } else {
      const subTree = tree.include[topLevelId];
      if (subTree !== true) tree.include[topLevelId] = this.__parseListItem(nestedPath, subTree);
    }

    return tree;
  }

  private static __parseSet(set: string, tree: Tree): Tree {
    const setItems = set.split(',');

    if ('include' in tree) {
      tree = { exclude: tree.include };

      for (const id in tree.exclude) if (!setItems.includes(id)) delete tree.exclude[id];

      for (const item of setItems) {
        if (item in tree.exclude) {
          delete tree.exclude[item];
        } else {
          tree.exclude[item] = true;
        }
      }
    } else {
      for (const id in tree.exclude) if (!setItems.includes(id)) delete tree.exclude[id];
    }

    return tree;
  }

  private static __parseListItem(listItem: string, tree: Tree = { include: {} }): Tree {
    if (listItem.includes(':')) return this.__parsePath(listItem, tree);
    if (listItem.startsWith('not=')) return this.__parseSet(listItem.substring(4), tree);

    if ('include' in tree) {
      tree.include[listItem] = true;
    } else {
      for (const id in tree.exclude) if (id === listItem) delete tree.exclude[id];
    }

    return tree;
  }

  private static __parseList(list: string, tree: Tree = { include: {} }): Tree {
    return list.split(' ').reduce((newTree, listItem) => this.__parseListItem(listItem, newTree), tree);
  }

  private static __lintList(list: string): string {
    let position: 'list' | 'path' | 'set' | 'set-item' = 'list';
    let result = '';

    for (let i = 0; i < list.length; ++i) {
      const character = list.charAt(i);

      try {
        if (position === 'list') {
          if (/^\s$/.test(character)) {
            if (!/^\s$/.test(list[i - 1] ?? ' ')) result += ' ';
            continue;
          }

          if (/^[a-z]$/.test(character)) {
            result += character;
            position = 'path';
            continue;
          }

          throw new SyntaxError(`Expected [a-z] or a whitespace, but got "${character}" instead.`);
        }

        if (position === 'path') {
          if (/^[a-z]$/.test(character)) {
            result += character;
            continue;
          }

          if (character === '-') {
            if (list[i - 1] === '-' || list[i - 1] === ':') {
              throw new SyntaxError(`Expected [a-z], but got "${character}" instead.`);
            } else {
              result += character;
              continue;
            }
          }

          if (character === ':') {
            if (list[i - 1] === ':' || list[i - 1] === '-') {
              throw new SyntaxError(`Expected [a-z], but got "${character}" instead.`);
            } else {
              result += character;
              continue;
            }
          }

          if (character === '=') {
            if (list[i - 1] === '=' || list[i - 1] === ':' || list[i - 1] === '-') {
              throw new SyntaxError(`Expected [a-z], but got "${character}" instead.`);
            }

            if (result.endsWith('not') && (result.length === 3 || !/[a-z]|-/.test(result[i - 4]))) {
              result += character;
              position = 'set';
              continue;
            } else {
              throw new SyntaxError(`Expected [a-z] or ":", but got "${character}" instead.`);
            }
          }

          if (/^\s$/.test(character)) {
            result += ' ';
            position = 'list';
            continue;
          }

          throw new SyntaxError(`Expected [a-z], ",", ":", ":" or a whitespace, but got "${character}" instead.`);
        }

        if (position === 'set') {
          if (/^\s$/.test(character)) continue;

          if (/^[a-z]|\*$/.test(character)) {
            position = 'set-item';
            result += character;
            continue;
          }

          throw new SyntaxError(`Expected [a-z] or a whitespace, but got "${character}" instead.`);
        }

        if (position === 'set-item') {
          if (list[i - 1] === '*') {
            if (character === ',') {
              result += character;
              position = 'set';
              continue;
            }

            if (/^\s$/.test(character)) {
              if (i !== list.length - 1) result += ' ';
              position = 'list';
              continue;
            }

            throw new SyntaxError(`Expected "," or a whitespace, but got "${character}" instead.`);
          } else {
            if (/^[a-z]$/.test(character)) {
              result += character;
              continue;
            }

            if (character === '-') {
              if (list[i - 1] === '-' || list[i - 1] === ':' || list[i - 1] === '=') {
                throw new SyntaxError(`Expected [a-z], but got "${character}" instead.`);
              } else {
                result += character;
                continue;
              }
            }

            if (character === ',') {
              result += character;
              position = 'set';
              continue;
            }

            if (/^\s$/.test(character)) {
              if (i !== list.length - 1) result += ' ';
              position = 'list';
              continue;
            }

            throw new SyntaxError(`Expected [a-z], "," or a whitespace, but got "${character}" instead.`);
          }
        }
      } catch (err) {
        const hint = 'This error occured at: ';
        const trim = (v: string) => v.substring(Math.max(0, i - 30), i + 30);
        const preview = trim(list);
        const pointer = ' '.repeat(hint.length) + trim('^'.padStart(i + 1, ' '));

        throw new SyntaxError([err.message, `${hint}${preview}`, pointer].join('\n'));
      }
    }

    return result.trimEnd();
  }

  private static __parse(list: string): Tree {
    return this.__parseList(this.__lintList(list));
  }

  private static __stringifyTree(tree: Tree, path?: string): string {
    const parts: string[] = [];

    if ('include' in tree) {
      for (const id in tree.include) {
        const nestedTree = tree.include[id];
        const newPath = path ? [path, id].join(':') : id;

        if (nestedTree === true) {
          parts.push(newPath);
        } else {
          parts.push(this.__stringifyTree(nestedTree, newPath));
        }
      }
    } else {
      const ids: string[] = [];
      const partsToPush: string[] = [];

      for (const id in tree.exclude) {
        const nestedTree = tree.exclude[id];
        const newPath = path ? [path, id].join(':') : id;

        ids.push(id);
        if (nestedTree !== true) partsToPush.push(this.__stringifyTree(nestedTree, newPath));
      }

      parts.push(`${path ? `${path}:` : ''}not=${ids.join(',')}`, ...partsToPush);
    }

    return parts.join(' ');
  }
}

const falseBooleanSelectorSingleton = new BooleanSelector('');
const trueBooleanSelectorSingleton = new BooleanSelector('not=*');
