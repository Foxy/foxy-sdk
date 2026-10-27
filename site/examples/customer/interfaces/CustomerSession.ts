import { API } from '@foxy.io/sdk/customer';
import type { CustomerSession } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

// The client stores the sign-in response. Read its fields from storage.
const raw = api.storage.getItem(API.SESSION);
const session: CustomerSession | null = raw ? JSON.parse(raw) : null;
console.log(session?.expires_in, session?.force_password_reset);
