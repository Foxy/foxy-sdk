/**
 * @vitest-environment jsdom
 */

import * as Checkout from '../../checkout';

import { API as HttpCheckoutAPI } from '../../checkout/API';

describe('Checkout', () => {
  it('exports concrete API class as API', () => {
    expect(Checkout).toHaveProperty('API', HttpCheckoutAPI);
  });

  it('does not export MockCheckoutAPI', () => {
    expect(Checkout).not.toHaveProperty('MockCheckoutAPI');
  });

  // Pins the exact published surface of `@foxy.io/sdk/checkout`. Types are
  // erased at runtime and so aren't visible here, but every *value* export —
  // including anything a stray `export *` might leak, such as the
  // region-catalog internals (`REGION_CATALOG_LOADERS`, `resolveCatalog`,
  // the module-level cache) — shows up in `Object.keys`. A build-and-grep
  // against `dist/` would catch the same slip today but evaporates the
  // moment someone runs `rm -rf dist`; this runs on every `vitest run`.
  it('exports exactly the intended set of value bindings, nothing more', () => {
    expect(Object.keys(Checkout).sort()).toEqual([
      'API',
      'REGION_TYPE_BY_COUNTRY',
      'loadRegionMessages',
      'regionLabelMessageId',
      'regionMessageId',
      'toCountryOptions',
      'toRegionOptions',
    ]);
  });
});
