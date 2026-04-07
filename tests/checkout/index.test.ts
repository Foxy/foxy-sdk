/**
 * @jest-environment jsdom
 */

import * as Checkout from '../../src/checkout';

import { HttpCheckoutAPI } from '../../src/checkout/API';

describe('Checkout', () => {
  it('exports concrete API class as API', () => {
    expect(Checkout).toHaveProperty('API', HttpCheckoutAPI);
  });

  it('does not export MockCheckoutAPI', () => {
    expect(Checkout).not.toHaveProperty('MockCheckoutAPI');
  });
});
