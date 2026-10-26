import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application } from 'typedoc';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(siteDir, 'content/docs/reference');
const graphDirs = { admin: join(siteDir, '../src/admin/Graph'), customer: join(siteDir, '../src/customer/Graph') };

const SECTIONS = [
  ['admin', 'Admin API'],
  ['customer', 'Customer API'],
  ['checkout', 'Checkout API'],
  ['core', 'Core'],
];
const KIND_ORDER = ['index', 'classes', 'functions', 'variables', 'interfaces', 'type-aliases', 'namespaces'];
const SUBENTRY_ORDER = ['client', 'loader', 'side-cart', 'add-to-cart'];

/** Turns relative `.mdx` links between generated pages into site URLs. `fromPath` is relative to `content/docs`. */
export function rewriteLinks(mdx, fromPath) {
  return mdx.replace(/\]\(((?![a-z]+:|\/|#)[^)\s#]*?)\.mdx(#[^)\s]*)?\)/g, (_, target, hash = '') => {
    let page = posix.join(posix.dirname(fromPath), target);
    if (posix.basename(page) === 'README') page = posix.dirname(page);
    // individual Rels members are not documented, so their links go to the namespace summary
    const rels = page.match(/^(.*\/namespaces\/Rels)\/(?:interfaces|type-aliases)\//);
    if (rels) return `](/docs/${rels[1]})`;
    return `](/docs/${page}${hash})`;
  });
}

/** Makes text from doc comments safe for MDX: raw HTML and braces outside code become plain text. */
export function escapeForMdx(mdx) {
  // split keeps fenced blocks and inline code spans at odd indexes
  return mdx
    .split(/(^```[\s\S]*?^```|`[^`\n]*`)/m)
    .map((part, i) => {
      if (i % 2) return part;
      return part
        .replace(/<br\s*\/?>/gi, '<br />')
        .replace(/(?<!\\)\{/g, '\\{')
        .replace(/(?<!\\)\}/g, '\\}')
        .replace(/(?<!\\)<(?!br \/>|a id="[^"]*"><\/a>|\/a>)(?=[a-zA-Z/!])/g, '\\<');
    })
    .join('');
}

/** One summary page body for a `Rels` namespace. Admin members link to their Hypermedia API docs. */
export function relsSummary(api, members) {
  const link = curie => (api === 'admin' ? `https://api.foxy.io/rels/${curie.replace(/^fx:/, '')}` : 'https://api.foxy.io/docs');
  const rows = members.map(({ name, curie }) => `| \`${name}\` | ${curie ? `[${curie}](${link(curie)})` : ''} |`);
  const intro =
    api === 'admin'
      ? 'Types for every resource in the Admin API. Each links to its page in the Hypermedia API docs.'
      : 'Types for every resource in the Customer API. See the [API docs](https://api.foxy.io/docs).';
  return `${intro}\n\n| Type | Rel |\n| --- | --- |\n${rows.join('\n')}\n`;
}

/** Reads `curie` of every Graph interface in a folder of `.d.ts` files. */
function readCuries(dir) {
  const curies = new Map();
  for (const file of readdirSync(dir)) {
    for (const chunk of readFileSync(join(dir, file), 'utf8').split(/^export /m)) {
      const name = chunk.match(/^interface (\w+)/)?.[1];
      const curie = chunk.match(/^\s*curie: '([^']+)'/m)?.[1];
      if (name && curie) curies.set(name, curie);
    }
  }
  return curies;
}

/** Public entry points from `package.json` `exports`, as TypeDoc entry paths. */
export function entryPoints() {
  const { exports } = JSON.parse(readFileSync(join(siteDir, '../package.json'), 'utf8'));
  return Object.keys(exports)
    .filter(key => !key.startsWith('./internal/'))
    .map(key => {
      const name = key.slice(2);
      const found = [`src/${name}/index.ts`, `src/${name}.ts`].find(path => existsSync(join(siteDir, '..', path)));
      if (!found) throw new Error(`No source file for export ${key}.`);
      return `../${found}`;
    });
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function frontmatter(title, body) {
  return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body.replace(/^\n+/, '')}`;
}

/** Splits `# Heading` off the top of a page and returns the title without the TypeDoc kind prefix. */
function splitTitle(mdx, fallback) {
  const match = mdx.match(/^# (.+)\n/);
  if (!match) return { title: fallback, body: mdx };
  return { title: match[1].replace(/^(?:Class|Function|Interface|Type Alias|Variable|Namespace|Enumeration): /, ''), body: mdx.slice(match[0].length) };
}

// titles of the module index pages, keyed by folder
const moduleTitles = {
  reference: 'API reference',
  ...Object.fromEntries(SECTIONS.map(([dir, title]) => [`reference/${dir}`, title])),
  ...Object.fromEntries(SUBENTRY_ORDER.map(name => [`reference/checkout/${name}`, `@foxy.io/sdk/checkout/${name}`])),
};

function writeMeta(dir, title, pages) {
  writeFileSync(join(dir, 'meta.json'), `${JSON.stringify({ title, pages }, null, 2)}\n`);
}

export async function generateReference() {
  process.chdir(siteDir); // typedoc.json is found from the cwd
  const tmp = mkdtempSync(join(tmpdir(), 'foxy-sdk-reference-'));
  try {
    const app = await Application.bootstrapWithPlugins({ out: tmp, entryPoints: entryPoints() });
    const project = await app.convert();
    if (!project) throw new Error('TypeDoc could not convert the SDK source.');
    await app.generateOutputs(project);
    if (app.logger.hasErrors()) throw new Error('TypeDoc reported errors.');

    // modules are named after their path from the repo root (`src/admin`), so lift them up
    for (const entry of readdirSync(join(tmp, 'src'))) renameSync(join(tmp, 'src', entry), join(tmp, entry));
    rmSync(join(tmp, 'src'), { recursive: true });
    const top = join(tmp, 'README.mdx');
    writeFileSync(top, readFileSync(top, 'utf8').replace(/\]\(src\//g, '](').replace(/\[src\//g, '['));

    // Rels members are summarised on one page per namespace
    for (const api of ['admin', 'customer']) {
      const relsDir = join(tmp, api, 'namespaces/Rels');
      const curies = readCuries(graphDirs[api]);
      const readme = readFileSync(join(relsDir, 'README.mdx'), 'utf8');
      const members = [...readme.matchAll(/^- \[(\w+)\]\(/gm)].map(m => ({ name: m[1], curie: curies.get(m[1]) ?? null }));
      rmSync(join(relsDir, 'interfaces'), { recursive: true, force: true });
      rmSync(join(relsDir, 'type-aliases'), { recursive: true, force: true });
      writeFileSync(join(relsDir, 'README.mdx'), `# Rels\n\n${relsSummary(api, members)}`);
    }

    rmSync(outDir, { recursive: true, force: true });
    for (const file of walk(tmp)) {
      const rel = posix.join('reference', file.slice(tmp.length + 1).split('\\').join('/'));
      const isReadme = basename(file) === 'README.mdx';
      const target = join(siteDir, 'content/docs', isReadme ? join(dirname(rel), 'index.mdx') : rel);
      const { title, body } = splitTitle(readFileSync(file, 'utf8'), basename(file, '.mdx'));
      const pageTitle = moduleTitles[rel.replace(/\/README\.mdx$/, '')] ?? title;
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, frontmatter(pageTitle, rewriteLinks(escapeForMdx(body), rel)));
    }

    writeMeta(outDir, 'API reference', ['index', ...SECTIONS.map(([dir]) => dir)]);
    for (const [dir, title] of SECTIONS) {
      const section = join(outDir, dir);
      const sub = readdirSync(section, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
      const ordered = [...KIND_ORDER, ...SUBENTRY_ORDER].filter(name => name === 'index' || sub.includes(name));
      writeMeta(section, title, ordered);
      for (const name of SUBENTRY_ORDER) {
        const subDir = join(section, name);
        if (!sub.includes(name)) continue;
        const kinds = readdirSync(subDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
        writeMeta(subDir, `@foxy.io/sdk/${dir}/${name}`, KIND_ORDER.filter(n => n === 'index' || kinds.includes(n)));
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await generateReference();
