import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listInternalMembers, listPublicExports, subentries } from './exports.mjs';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const unescape = text => text.replace(/\\(.)/g, '$1');

/** Page of an export inside its entry folder, or `null`. */
function findPage(entryDir, name) {
  if (!existsSync(entryDir)) return null;
  for (const kind of readdirSync(entryDir, { withFileTypes: true })) {
    if (!kind.isDirectory()) continue;
    for (const candidate of [join(entryDir, kind.name, `${name}.mdx`), join(entryDir, kind.name, name, 'index.mdx')]) {
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/** Names of the `###` headings of a page, without `()` and escapes. */
function headings(page) {
  return [...readFileSync(page, 'utf8').matchAll(/^### (.+)$/gm)].map(([, text]) => unescape(text).replace(/(\(\))?\??$/, ''));
}

/** Ids like `./admin API.signIn` of exports and class members that have no page or `### ` heading. */
export function findMissing(exports, referenceDir) {
  const missing = [];
  for (const [key, list] of exports) {
    const entryDir = join(referenceDir, key.slice(2));
    const index = join(entryDir, 'index.mdx');
    for (const { name, members } of list) {
      const page = findPage(entryDir, name);
      // an entry that only re-exports another one lists the export under `## References`
      if (!page) {
        if (!existsSync(index) || !headings(index).includes(name)) missing.push(`${key} ${name}`);
        continue;
      }
      const found = headings(page);
      for (const member of members) if (!found.includes(member)) missing.push(`${key} ${name}.${member}`);
    }
  }
  return missing;
}

/** Ids like `./admin API.snapshot` of `@internal` members that have a heading on a page. */
export function findInternalLeaks(referenceDir) {
  const leaks = [];
  for (const [name, members] of listInternalMembers()) {
    for (const entry of readdirSync(referenceDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dirs = [join(referenceDir, entry.name)];
      if (entry.name === 'checkout') dirs.push(...subentries('checkout').map(sub => join(referenceDir, 'checkout', sub)));
      for (const dir of dirs) {
        const page = findPage(dir, name);
        if (!page) continue;
        const found = headings(page);
        for (const member of members) if (found.includes(member)) leaks.push(`${page.slice(referenceDir.length + 1)} ${member}`);
      }
    }
  }
  return leaks;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const referenceDir = join(siteDir, 'content/docs/reference');
  const missing = findMissing(listPublicExports(), referenceDir);
  const leaks = findInternalLeaks(referenceDir);
  if (missing.length) console.error(`Public exports with no page:\n${missing.map(id => `  ${id}`).join('\n')}`);
  if (leaks.length) console.error(`@internal members on a page:\n${leaks.map(id => `  ${id}`).join('\n')}`);
  process.exit(missing.length || leaks.length ? 1 : 0);
}
