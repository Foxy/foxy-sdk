import * as FoxySDK from '../src/index';
import * as FoxySDKCore from '../src/core';
import * as FoxySDKCustomer from '../src/customer';
import * as FoxySDKIntegration from '../src/integration';

describe('Index', () => {
  it('exports core modules as Core', () => {
    expect(FoxySDK).toHaveProperty('Core', FoxySDKCore);
  });

  it('exports customer sdk modules as Customer', () => {
    expect(FoxySDK).toHaveProperty('Customer', FoxySDKCustomer);
  });

  it('exports integration sdk modules as Integration', () => {
    expect(FoxySDK).toHaveProperty('Integration', FoxySDKIntegration);
  });
});
