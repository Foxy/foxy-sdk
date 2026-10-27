import { API } from '@foxy.io/sdk/admin';

const api = new API({
  clientId: 'client_123',
  clientSecret: process.env.FOXY_CLIENT_SECRET!,
});

// Restore tokens you saved earlier. The API refreshes them when needed.
api.setTokens({ refreshToken: process.env.FOXY_REFRESH_TOKEN! });

const response = await api.follow('fx:store').get();
const store = await response.json();
console.log(store.store_name);
