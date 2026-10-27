import { existsSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

import { findInternalLeaks, findMissing } from '../scripts/check-completeness.mjs';
import { listInternalMembers, listPublicExports } from '../scripts/exports.mjs';
import { generateReference } from '../scripts/reference.mjs';

const dir = 'content/docs/reference';

describe('reference completeness', () => {
  beforeAll(async () => {
    if (!existsSync(dir)) await generateReference();
  }, 300_000);

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
    expect(keys).toHaveLength(7);
    expect(exports.get('./admin')!.map((e: { name: string }) => e.name)).toContain('Rels');
  });
});
