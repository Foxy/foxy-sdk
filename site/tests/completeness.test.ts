import { compile } from '@mdx-js/mdx';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { describe, expect, it } from 'vitest';

import { findInternalLeaks, findMissing } from '../scripts/check-completeness.mjs';
import { entryPoints, listInternalMembers, listPublicExports, subentries } from '../scripts/exports.mjs';

const dir = 'content/docs/reference';

function listMdx(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return listMdx(child);
    return entry.name.endsWith('.mdx') ? [child] : [];
  });
}

describe('reference pages', () => {
  it('all compile, start with a title and hold no local paths', async () => {
    const files = listMdx(dir);
    expect(files.length).toBeGreaterThan(40);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/\/Users\/|\.\.\/\.\.\/\.\.\//);
      expect(text, file).toMatch(/^---\ntitle: /);
      await expect(compile(text, { remarkPlugins: [remarkFrontmatter, remarkGfm] }), file).resolves.toBeDefined();
    }
  }, 120_000);

  // examples/<page path>.ts is type-checked by `npm run examples:check`; the page must show it as is
  it('show their type-checked example', () => {
    const exportPages = listMdx(dir).filter(file => /\/(classes|functions|interfaces|variables)\//.test(file));
    expect(exportPages.length).toBeGreaterThan(25);
    for (const page of exportPages) {
      const example = join('examples', page.slice(dir.length + 1).replace(/\.mdx$/, '.ts'));
      const code = readFileSync(example, 'utf8').trim();
      expect(readFileSync(page, 'utf8'), page).toContain(`## Example\n\n\`\`\`ts\n${code}\n\`\`\``);
    }
  });
});

describe('public entries', () => {
  it('come from package.json exports', () => {
    expect(entryPoints().sort()).toEqual(
      [
        'admin/index', 'admin/signing', 'customer/index', 'checkout/index',
        'checkout/client', 'checkout/loader', 'checkout/side-cart', 'checkout/add-to-cart',
      ].map(name => `../src/${name}.ts`).sort(),
    );
  });

  it('list the subentries of each section', () => {
    expect(subentries('checkout').sort()).toEqual(['add-to-cart', 'client', 'loader', 'side-cart']);
    expect(subentries('admin')).toEqual(['signing']);
    expect(subentries('customer')).toEqual([]);
  });
});

describe('reference completeness', () => {

  it('finds every public export of the 8 entries on a page', () => {
    expect(findMissing(listPublicExports(), dir)).toEqual([]);
  });

  it('reports an export that has no page', () => {
    const exports = listPublicExports();
    exports.get('./admin')!.push({ name: 'NotARealExport', members: [] });
    expect(findMissing(exports, dir)).toContain('./admin NotARealExport');
  });

  it('reports a class member that has no heading', () => {
    const exports = listPublicExports();
    exports.get('./admin')!.find((e: { name: string }) => e.name === 'API')!.members.push('notAMember');
    expect(findMissing(exports, dir)).toContain('./admin API.notAMember');
  });

  it('shows no @internal member', () => {
    const internal = listInternalMembers();
    expect(internal.get('CartSession')).toEqual(expect.arrayContaining(['snapshot', 'isStale', 'storeChanged', 'boot', 'observe', 'ensure', 'settled']));
    expect(internal.get('API')).toEqual(expect.arrayContaining(['loadGooglePaySdk', 'validateApplePayMerchant']));
    expect(findInternalLeaks(dir)).toEqual([]);
  });

  it('skips internal subpaths and Rels members', () => {
    const exports = listPublicExports();
    const keys = [...exports.keys()];
    expect(keys).not.toContain('./internal/side-cart/protocol');
    expect(keys).not.toContain('./internal/core');
    expect(keys).toHaveLength(8);
    expect(exports.get('./admin')!.map((e: { name: string }) => e.name)).toContain('Rels');
  });
});
