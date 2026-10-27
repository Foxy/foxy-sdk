import { API } from '@foxy.io/sdk/admin';

const api = new API({ clientId: 'client_123', clientSecret: process.env.FOXY_CLIENT_SECRET! });
api.setTokens({ refreshToken: process.env.FOXY_REFRESH_TOKEN! });

// `get()` resolves with a `Response` for any status code. Check `ok` first.
const response = await api.follow('fx:store').get();
if (!response.ok) throw new Error(`Foxy API error ${response.status}`);

// `json()` is typed from the link you followed.
const store = await response.json();
console.log(store.store_domain);
