import { signValue } from '@foxy.io/sdk/admin/signing';

// Sign the value of a product input, for example `<input name="price" value="10">`.
const value = await signValue(process.env.FOXY_STORE_SECRET!, 'price', 'mug', '', 10);
console.log(value);
