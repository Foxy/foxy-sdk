import { API, ResolutionError } from 'https://cdn-js.foxy.io/sdk@2/customer.js';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

try {
  await api.follow('fx:default_payment_method').get();
} catch (error) {
  if (error instanceof ResolutionError) {
    // A resource on the way could not be read, or it has no such link.
    console.error(error.response.status, error.response.url);
  } else {
    throw error;
  }
}
