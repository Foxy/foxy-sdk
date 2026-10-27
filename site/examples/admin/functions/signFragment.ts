import { signFragment } from '@foxy.io/sdk/admin';
import { JSDOM } from 'jsdom';

const html = '<form action="https://example.foxycart.com/cart"><input name="code" value="mug"></form>';
const { document } = new JSDOM(html).window;

// Signs every cart form and cart link in the tree, in place.
await signFragment(process.env.FOXY_STORE_SECRET!, document);
console.log(document.body.innerHTML);
