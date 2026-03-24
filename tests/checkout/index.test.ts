/**
 * @jest-environment jsdom
 */

import * as Checkout from '../../src/checkout';

import { API } from '../../src/checkout/api';
import { HttpCheckoutAPI } from '../../src/checkout/implementations/http-api';
import { MockCheckoutAPI } from '../../src/checkout/implementations/mock-api';

describe('Checkout', () => {
  it('exports API contract', () => {
    expect(Checkout).toHaveProperty('API', API);
  });

  it('exports concrete API implementations', () => {
    expect(Checkout).toHaveProperty('HttpCheckoutAPI', HttpCheckoutAPI);
    expect(Checkout).toHaveProperty('MockCheckoutAPI', MockCheckoutAPI);
  });
});