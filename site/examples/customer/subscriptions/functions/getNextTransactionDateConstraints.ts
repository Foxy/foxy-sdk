import { API } from '@foxy.io/sdk/customer';
import { getNextTransactionDateConstraints } from '@foxy.io/sdk/customer/subscriptions';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });
const subscriptions = await api.follow('fx:subscriptions').get().then(response => response.json());
const subscription = subscriptions._embedded['fx:subscriptions'][0];

// Rules come from the customer portal settings of your store.
const rules = [{ jsonata_query: 'true', min: '1w', max: '3m' }];
const constraints = getNextTransactionDateConstraints(subscription, rules);

// true: any date. false: no changes. An object: limits for a date picker.
console.log(constraints);
