import { API } from '@foxy.io/sdk/customer';

const api = new API({ base: new URL('https://example.foxycart.com/s/customer/') });
await api.signIn({ email: 'customer@example.com', password: 'password' });

// `get()` resolves with a `Response` for any status code. Check `ok` first.
const response = await api.get();
if (!response.ok) throw new Error(`Foxy API error ${response.status}`);

// `json()` is typed from the link you followed.
const customer = await response.json();
console.log(customer.email);
