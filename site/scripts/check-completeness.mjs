import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listInternalMembers, listPublicExports, subentries } from './exports.mjs';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const unescape = text => text.replace(/\\(.)/g, '$1');

/** Lines of a page's frontmatter. */
const frontmatter = page => (readFileSync(page, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '').split('\n');

/** True when the page's frontmatter lists the name, as in `documents: API, CartSession`. */
const documents = (page, name) =>
  frontmatter(page).some(line => line.startsWith('documents: ') && line.slice(11).split(/,\s*/).includes(name));

/**
 * Page of an export inside its entry folder, or `null`. A type with no page of its own is
 * found on the page that says `documents: <name>`, like checkout's `client` or the Side Cart index.
 */
function findPage(entryDir, name) {
  if (!existsSync(entryDir)) return null;
  const kinds = readdirSync(entryDir, { withFileTypes: true }).filter(kind => kind.isDirectory());
  for (const kind of kinds) {
    for (const candidate of [join(entryDir, kind.name, `${name}.mdx`), join(entryDir, kind.name, name, 'index.mdx')]) {
      if (existsSync(candidate)) return candidate;
    }
  }
  const pages = kinds.flatMap(kind =>
    readdirSync(join(entryDir, kind.name)).filter(file => file.endsWith('.mdx')).map(file => join(entryDir, kind.name, file)),
  );
  return [...pages, join(entryDir, 'index.mdx')].find(page => existsSync(page) && documents(page, name)) ?? null;
}

/** A `###` heading's text without escapes, `<MemberMeta />` and `[#id]`. */
const headingText = text => unescape(text.replace(/ <MemberMeta .*\/>/, '').replace(/ \[#[^\]]+\]$/, ''));

/**
 * Names of the `###` headings of a page, without `()`, escapes, `<MemberMeta />`, `[#id]` and an
 * owner prefix: `session.start()` on the client page is the `start` member of `CartSession`.
 */
function headings(page) {
  return [...readFileSync(page, 'utf8').matchAll(/^### (.+)$/gm)].map(([, text]) =>
    headingText(text).replace(/(\(\))?\??$/, '').replace(/^[a-z]\w*\./, ''),
  );
}

/** Ids like `./admin API.signIn` of exports and class members that have no page or `### ` heading. */
export function findMissing(exports, referenceDir) {
  const missing = [];
  for (const [key, list] of exports) {
    const entryDir = join(referenceDir, key.slice(2));
    // an export with no page of its own has a `###` heading on the entry's index page
    // (re-exports, the add-to-cart alias) or on its types page (type aliases, Rels)
    const shared = ['index.mdx', 'types.mdx'].map(file => join(entryDir, file)).filter(existsSync).flatMap(headings);
    for (const { name, members } of list) {
      const page = findPage(entryDir, name);
      if (!page) {
        if (!shared.includes(name)) missing.push(`${key} ${name}`);
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
      dirs.push(...subentries(entry.name).map(sub => join(referenceDir, entry.name, sub)));
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

/** Files under `dir`, recursively. */
const walk = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

/**
 * Ids like `admin/classes/API.mdx signIn` of class and interface members with no description:
 * no text in the member's block outside code and its Parameters, Returns or similar sub-sections.
 */
export function findUndescribed(referenceDir) {
  const undescribed = [];
  for (const page of walk(referenceDir).filter(f => /\/(classes|interfaces|variables)\/[^/]+\.mdx$/.test(f) || frontmatter(f).some(line => line.startsWith('documents: ')))) {
    const text = readFileSync(page, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, section] of text.matchAll(/^## (?:Properties|Accessors|Methods|Session properties|Session accessors|Session methods)\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)) {
      for (const block of section.split(/^(?=### )/m).filter(b => b.startsWith('### '))) {
        const [heading, ...lines] = block.split('\n');
        let sub = '';
        const described = lines.some(line => {
          if (line.startsWith('#')) return (sub = line.replace(/^#+ /, '')), false;
          const prose = line.trim() && !line.startsWith('|') && line.trim() !== '***';
          return prose && (!sub || /Signature$/.test(sub));
        });
        if (!described) undescribed.push(`${page.slice(referenceDir.length + 1)} ${headingText(heading.slice(4))}`);
      }
    }
  }
  return undescribed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const referenceDir = join(siteDir, 'content/docs/reference');
  const missing = findMissing(listPublicExports(), referenceDir);
  const leaks = findInternalLeaks(referenceDir);
  const undescribed = findUndescribed(referenceDir);
  if (missing.length) console.error(`Public exports with no page:\n${missing.map(id => `  ${id}`).join('\n')}`);
  if (leaks.length) console.error(`@internal members on a page:\n${leaks.map(id => `  ${id}`).join('\n')}`);
  if (undescribed.length) console.error(`Members with no description:\n${undescribed.map(id => `  ${id}`).join('\n')}`);
  process.exit(missing.length || leaks.length || undescribed.length ? 1 : 0);
}
