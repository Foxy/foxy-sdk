import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
  exports: Record<string, unknown>;
};

describe('package.json', () => {
  it('publishes exactly these subpaths and no root entry', () => {
    expect(Object.keys(pkg.exports).sort()).toStrictEqual([
      './admin',
      './checkout',
      './checkout/add-to-cart',
      './checkout/client',
      './checkout/loader',
      './checkout/side-cart',
      './checkout/side-cart/protocol',
      './core',
      './customer',
    ]);
  });
});
