import { compile } from '@mdx-js/mdx';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { describe, expect, it } from 'vitest';

import { entryPoints, escapeForMdx, generateReference, relsSummary, rewriteLinks } from '../scripts/reference.mjs';

const compileMdx = (text: string) => compile(text, { remarkPlugins: [remarkFrontmatter, remarkGfm] });

function listMdx(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listMdx(path);
    return entry.name.endsWith('.mdx') ? [path] : [];
  });
}

describe('reference generator', () => {
  it('rewrites relative .mdx links to site URLs', () => {
    expect(rewriteLinks('[`API`](../../core/classes/API.mdx)', 'reference/admin/classes/API.mdx')).toBe(
      '[`API`](/docs/reference/core/classes/API)',
    );
  });

  it('points links to removed Rels members at the Rels summary page', () => {
    expect(rewriteLinks('[Store](../namespaces/Rels/interfaces/Store.mdx#links)', 'reference/admin/classes/API.mdx')).toBe(
      '[Store](/docs/reference/admin/namespaces/Rels)',
    );
  });

  it('keeps a raw <br> from a doc comment as text', async () => {
    const out = escapeForMdx('Weight in pounds.<br> Default 0. Use {value}.');
    await expect(compileMdx(out)).resolves.toBeDefined();
  });

  it('keeps TypeDoc anchors in table cells', async () => {
    const table = '| a |\n| --- |\n| <a id="type-parameter-t"></a> `T` <br> x |\n';
    const out = escapeForMdx(table);
    expect(out).toContain('<a id="type-parameter-t"></a>');
    await expect(compileMdx(out)).resolves.toBeDefined();
  });

  it('derives entry points from package.json exports', () => {
    expect(entryPoints().sort()).toEqual(
      [
        'admin/index', 'customer/index', 'checkout/index', 'core/index',
        'checkout/client', 'checkout/loader', 'checkout/side-cart', 'checkout/add-to-cart',
      ].map(name => `../src/${name}.ts`).sort(),
    );
  });

  it('leaves code blocks untouched', () => {
    const code = '```ts\nconst a = { b: 1 } as Array<string>;\n```\n\nInline `{x}`.';
    expect(escapeForMdx(code)).toBe(code);
  });

  it('links admin Rels members to api.foxy.io', () => {
    expect(relsSummary('admin', [{ name: 'StoreShippingMethod', curie: 'fx:store_shipping_method' }])).toContain(
      'https://api.foxy.io/rels/store_shipping_method',
    );
  });

  it('links customer Rels members to the API docs', () => {
    expect(relsSummary('customer', [{ name: 'Attribute', curie: 'fx:attribute' }])).toContain('https://api.foxy.io/docs');
  });

  it('generated pages contain no local paths and all compile', async () => {
    await generateReference();
    const files = listMdx('content/docs/reference');
    expect(files.length).toBeGreaterThan(50);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/\/Users\/|\.\.\/\.\.\/\.\.\//);
      expect(text, file).toMatch(/^---\ntitle: /);
      await expect(compileMdx(text), file).resolves.toBeDefined();
    }
  }, 600_000);

  it('starts each section index with its overview and still lists the exports', async () => {
    await generateReference();
    const admin = readFileSync('content/docs/reference/admin/index.mdx', 'utf8');
    expect(admin).toMatch(/^---\ntitle: "Admin API"\n---/);
    expect(admin).toContain('const url = api.signIn(');
    expect(admin).toMatch(/^- \[API\]\(/m);
  }, 600_000);
});
