/**
 * @vitest-environment jsdom
 */

import * as Checkout from '../../checkout';

import type {
  APIConstructorParams,
  CartSession,
  CheckOutPaymentOption,
  HydrateJsonOptions,
  Listener,
  SquareSdkInstance,
  SessionCookieOptions,
  SessionOptions,
  SessionStorageName,
  SessionStore,
} from '../../checkout';

import type { SideCart } from '../../checkout/side-cart';
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
      'loadRegionMessages',
      'regionLabelMessageId',
      'toCountryOptions',
      'toRegionOptions',
    ]);
  });

  it('exports the session types', () => {
    // The real assertion is the typecheck (`npm run verify`): it fails if a type is not exported.
    const store: SessionStore = { get: () => null, set: () => undefined, remove: () => undefined };
    const cookie: SessionCookieOptions = { sameSite: 'Lax' };
    const name: SessionStorageName = 'cookie';
    const options: SessionOptions = { storage: store, cookie, autoStart: false };
    const session: Pick<CartSession, 'id' | 'start' | 'end' | 'configure'> | null = null;
    expect([store, cookie, name, options, session]).toHaveLength(5);
  });

  it('exports the types its public methods use', () => {
    // The real assertion is the typecheck: it fails if a type is not exported.
    const types: [APIConstructorParams?, CheckOutPaymentOption?, HydrateJsonOptions?, Listener<'update', unknown>?, SquareSdkInstance?] = [];
    const sideCart: SideCart | null = null;
    expect([types, sideCart]).toHaveLength(2);
  });
});
