import { API } from '@foxy.io/sdk/customer';
import type { Graph } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

// The API root is the signed-in customer. Follow a link to go deeper.
const customer = await api.get().then(response => response.json());
const transactions = await api.follow('fx:transactions').get().then(response => response.json());
const email: Graph['props']['email'] = customer.email;
console.log(email, transactions.total_items);
