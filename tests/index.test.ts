/**
 * @jest-environment jsdom
 */

import * as FoxySDK from '../src/index.js';
import * as FoxySDKCheckout from '../src/checkout';
import * as FoxySDKBackend from '../src/backend';
import * as FoxySDKCore from '../src/core';
import * as FoxySDKCustomer from '../src/customer';

describe('Index', () => {
  it('exports core modules as Core', () => {
    expect(FoxySDK).toHaveProperty('Core', FoxySDKCore);
  });

  it('exports customer sdk modules as Customer', () => {
    expect(FoxySDK).toHaveProperty('Customer', FoxySDKCustomer);
  });

  it('exports backend sdk modules as Backend', () => {
    expect(FoxySDK).toHaveProperty('Backend', FoxySDKBackend);
  });

  it('exports checkout sdk modules as Checkout', () => {
    expect(FoxySDK).toHaveProperty('Checkout', FoxySDKCheckout);
  });
});
