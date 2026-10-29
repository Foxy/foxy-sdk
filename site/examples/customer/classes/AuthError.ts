import { API, AuthError } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });

try {
  await api.signIn({ email: 'customer@example.com', password: 'password' });
} catch (error) {
  if (error instanceof AuthError && error.code === AuthError.UNAUTHORIZED) {
    // The email or the password is wrong.
    console.error('Check your email and password.');
  } else {
    throw error;
  }
}
