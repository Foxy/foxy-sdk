import { API } from '@foxy.io/sdk/customer';
import type { Credentials } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
const credentials: Credentials = { email: 'customer@example.com', password: 'password' };

// Wrong credentials throw an AuthError with the code UNAUTHORIZED.
await api.signIn(credentials);
