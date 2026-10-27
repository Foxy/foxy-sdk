import { API, ResolutionError } from '@foxy.io/sdk/admin';

const api = new API({ clientId: 'client_123', clientSecret: process.env.FOXY_CLIENT_SECRET! });
api.setTokens({ refreshToken: process.env.FOXY_REFRESH_TOKEN! });

try {
  await api.follow('fx:store').follow('fx:customers').get();
} catch (error) {
  if (error instanceof ResolutionError) {
    // A resource on the way could not be read, or it has no such link.
    console.error(error.response.status, error.response.url);
  } else {
    throw error;
  }
}
