import { API } from '@foxy.io/sdk/customer';
import type { SignUpParams } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
const params: SignUpParams = {
  email: 'customer@example.com',
  first_name: 'Jane',
  verification: { type: 'hcaptcha', token: 'token-from-hcaptcha-widget' },
};

await api.signUp(params);
