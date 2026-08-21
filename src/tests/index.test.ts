/**
 * @vitest-environment jsdom
 */

import * as FoxySDK from '../index.js';
import * as FoxySDKAdmin from '../admin/index.js';
import * as FoxySDKCheckout from '../checkout/index.js';
import * as FoxySDKCore from '../core/index.js';
import * as FoxySDKCustomer from '../customer/index.js';

describe('Index', () => {
  it('exports admin sdk modules as Admin', () => {
    expect(FoxySDK).toHaveProperty('Admin', FoxySDKAdmin);
  });

  it('exports checkout sdk modules as Checkout', () => {
    expect(FoxySDK).toHaveProperty('Checkout', FoxySDKCheckout);
  });

  it('exports core modules as Core', () => {
    expect(FoxySDK).toHaveProperty('Core', FoxySDKCore);
  });

  it('exports customer sdk modules as Customer', () => {
    expect(FoxySDK).toHaveProperty('Customer', FoxySDKCustomer);
  });

  it('exports exactly the documented namespaces and nothing more', () => {
    expect(Object.keys(FoxySDK).sort()).toStrictEqual(['Admin', 'Checkout', 'Core', 'Customer']);
  });
});
