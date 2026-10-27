import { API, isNextTransactionDate } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });
const subscriptions = await api.follow('fx:subscriptions').get().then(response => response.json());
const subscription = subscriptions._embedded['fx:subscriptions'][0];

// Settings come from the customer portal settings of your store.
const settings = { subscriptions: { allow_next_date_modification: true } };

// Is this date allowed as the next payment date?
console.log(isNextTransactionDate({ settings, subscription, value: '2030-01-15' }));
