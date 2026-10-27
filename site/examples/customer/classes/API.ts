import { API } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

// Read the signed-in customer and their first page of subscriptions.
const customer = await api.get().then(response => response.json());
const subscriptions = await api.follow('fx:subscriptions').get().then(response => response.json());
console.log(customer.email, subscriptions.returned_items);

await api.signOut();
