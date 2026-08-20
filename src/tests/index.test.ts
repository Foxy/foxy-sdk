/**
 * @vitest-environment jsdom
 */

import * as FoxySDK from '../index.js';
import * as FoxySDKCheckout from '../checkout/index.js';
import * as FoxySDKCore from '../core/index.js';
import * as FoxySDKCustomer from '../customer/index.js';

describe('Index', () => {
  it('exports checkout sdk modules as Checkout', () => {
    expect(FoxySDK).toHaveProperty('Checkout', FoxySDKCheckout);
  });

  it('exports core modules as Core', () => {
    expect(FoxySDK).toHaveProperty('Core', FoxySDKCore);
  });

  it('exports customer sdk modules as Customer', () => {
    expect(FoxySDK).toHaveProperty('Customer', FoxySDKCustomer);
  });
});
