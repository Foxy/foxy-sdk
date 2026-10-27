import { API } from '@foxy.io/sdk/customer';
import type { StoredSession } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

// The client keeps the session in its storage after sign-in.
const raw = api.storage.getItem(API.SESSION);
const session: StoredSession | null = raw ? JSON.parse(raw) : null;
console.log(session?.date_created, session?.expires_in);
