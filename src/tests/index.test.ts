/**
 * @vitest-environment jsdom
 */

import * as FoxySDK from '../index.js';
import * as FoxySDKCheckout from '../checkout/index.js';

describe('Index', () => {
  it('exports checkout sdk modules as Checkout', () => {
    expect(FoxySDK).toHaveProperty('Checkout', FoxySDKCheckout);
  });
});
