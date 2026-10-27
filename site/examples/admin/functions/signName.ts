import { signName } from '@foxy.io/sdk/admin';

// Sign the name of a product input, for example `<input name="price" value="10">`.
const name = await signName(process.env.FOXY_STORE_SECRET!, 'price', 'mug', '', 10);
console.log(name);
