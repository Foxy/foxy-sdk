import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Source files of the public entries from `package.json` `exports`, relative to `site/`. */
export function entryPoints() {
  const { exports } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  return Object.keys(exports)
    .filter(key => !key.startsWith('./internal/'))
    .map(key => {
      const name = key.slice(2);
      const found = [`src/${name}/index.ts`, `src/${name}.ts`].find(path => existsSync(join(root, path)));
      if (!found) throw new Error(`No source file for export ${key}.`);
      return `../${found}`;
    });
}

/** Subpath keys of the public entries, like `admin` or `checkout/client`. */
export function entryKeys() {
  return entryPoints().map(path => path.replace(/^\.\.\/src\//, '').replace(/(\/index)?\.ts$/, ''));
}

/** Names of the sub-entries of a section, like `client` for `checkout`. */
export function subentries(section) {
  return entryKeys()
    .filter(key => key.startsWith(`${section}/`))
    .map(key => key.slice(section.length + 1));
}

let cache;

/** One compiler program over all public entries, built once. */
function load() {
  if (cache) return cache;
  const config = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.build.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const entries = entryPoints().map(path => ({ key: `./${path.replace(/^\.\.\/src\//, '').replace(/(\/index)?\.ts$/, '')}`, file: join(root, 'site', path) }));
  const program = ts.createProgram(
    entries.map(entry => entry.file),
    config.options,
  );
  cache = { program, checker: program.getTypeChecker(), entries };
  return cache;
}

const isInternal = (checker, symbol) => symbol.getJsDocTags(checker).some(tag => tag.name === 'internal');

/** True for members that appear in the public API: not private, protected, `#private` or `@internal`. */
function isPublicMember(checker, member) {
  const decl = member.valueDeclaration ?? member.declarations?.[0];
  if (!decl) return false;
  const modifiers = ts.getCombinedModifierFlags(decl);
  if (modifiers & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) return false;
  if (decl.name && ts.isPrivateIdentifier(decl.name)) return false;
  return !isInternal(checker, member) && member.getName() !== 'prototype' && !ts.isConstructorDeclaration(decl);
}

/** Instance and static members of a class or interface symbol, each with its symbol and whether the type declares it itself. */
function typeMembers(checker, symbol) {
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const own = new Set(symbol.declarations ?? []);
  const lists = [checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))];
  if (symbol.flags & ts.SymbolFlags.Class) lists.push(checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(symbol, decl)));
  return lists.flat().map(member => ({
    member,
    declaredHere: (member.declarations ?? []).some(d => own.has(d.parent)),
  }));
}

function* publicExports() {
  const { checker, program, entries } = load();
  for (const { key, file } of entries) {
    const mod = checker.getSymbolAtLocation(program.getSourceFile(file));
    for (const exported of checker.getExportsOfModule(mod)) {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      yield { key, name: exported.getName(), symbol: target };
    }
  }
}

/**
 * Public exports of every public entry, keyed by subpath (`./admin`).
 * `members` holds the public members a class declares itself, statics included.
 * Inherited members are not listed, so a subclass page may document them or not.
 */
export function listPublicExports() {
  const { checker } = load();
  const result = new Map(load().entries.map(({ key }) => [key, []]));
  for (const { key, name, symbol } of publicExports()) {
    if (isInternal(checker, symbol)) continue;
    const isClass = symbol.flags & ts.SymbolFlags.Class && symbol.valueDeclaration && ts.isClassDeclaration(symbol.valueDeclaration);
    const members = isClass
      ? typeMembers(checker, symbol)
          .filter(({ member, declaredHere }) => declaredHere && isPublicMember(checker, member))
          .map(({ member }) => member.getName())
      : [];
    result.get(key).push({ name, members: [...new Set(members)] });
  }
  return result;
}

/** `Class` -> names of its `@internal` members (own or inherited), for classes and interfaces. */
export function listInternalMembers() {
  const { checker } = load();
  const result = new Map();
  for (const { name, symbol } of publicExports()) {
    if (!(symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface))) continue;
    const names = typeMembers(checker, symbol)
      .filter(({ member }) => isInternal(checker, member))
      .map(({ member }) => member.getName());
    if (names.length) result.set(name, [...new Set([...(result.get(name) ?? []), ...names])]);
  }
  return result;
}
