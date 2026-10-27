import { API } from '@foxy.io/sdk/admin';
import type { Graph } from '@foxy.io/sdk/admin';

const api = new API({ clientId: 'client_123', clientSecret: process.env.FOXY_CLIENT_SECRET! });
api.setTokens({ refreshToken: process.env.FOXY_REFRESH_TOKEN! });

// `Graph` is the API root. Its links are the curies you can follow from `api`.
const link: keyof Graph['links'] = 'fx:store';
const store = await api.follow(link).get().then(response => response.json());
console.log(store.store_name);
