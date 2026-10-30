import { API } from '@foxy.io/sdk/customer';
import type { StoredSession } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });

// The API keeps the session in memory only. Save it to keep the customer signed in after a reload.
const saved = localStorage.getItem('customer-session');
if (saved) api.setSession(JSON.parse(saved) as StoredSession);

api.addEventListener('session', event => {
  if (event.detail) localStorage.setItem('customer-session', JSON.stringify(event.detail));
  else localStorage.removeItem('customer-session');
});

if (!api.session) await api.signIn({ email: 'customer@example.com', password: 'password' });

// Read the signed-in customer and their first page of subscriptions.
const customer = await api.get().then(response => response.json());
const subscriptions = await api.follow('fx:subscriptions').get().then(response => response.json());
console.log(customer.email, subscriptions.returned_items);
