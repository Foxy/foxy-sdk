import { API, AuthError } from '@foxy.io/sdk/admin';

const api = new API({ clientId: 'client_123', clientSecret: process.env.FOXY_CLIENT_SECRET! });
api.setTokens({ refreshToken: process.env.FOXY_REFRESH_TOKEN! });

try {
  await api.follow('fx:store').get();
} catch (error) {
  if (error instanceof AuthError && error.code === AuthError.TOKEN_REFRESH_FAILED) {
    // The refresh token is no longer valid. Ask the user to sign in again.
    console.error('Sign in again.', error.originalError);
  } else {
    throw error;
  }
}
