import { client } from '@foxy.io/sdk/checkout/client';

// Keep the session ID in a cookie. Do this before the store domain is set.
client.session.configure({
  storage: 'cookie',
  cookie: { maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' },
});

// Later, when the shopper signs out, forget the session and reset the cart.
await client.session.end({ reset: true });
