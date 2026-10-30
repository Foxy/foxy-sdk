import { API } from 'https://cdn-js.foxy.io/sdk@2/customer.js';
import { getAllowedFrequencies } from 'https://cdn-js.foxy.io/sdk@2/customer/subscriptions.js';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });
const subscriptions = await api.follow('fx:subscriptions').get().then(response => response.json());
const subscription = subscriptions._embedded['fx:subscriptions'][0];

// Settings come from the customer portal settings of your store.
const settings = {
  subscriptions: {
    allow_frequency_modification: [{ jsonata_query: 'frequency = "1m"', values: ['1m', '3m', '1y'] }],
  },
};

console.log([...getAllowedFrequencies({ settings, subscription })]);
