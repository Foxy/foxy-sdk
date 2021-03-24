import * as FoxySDK from '../src/index.js';
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
});
