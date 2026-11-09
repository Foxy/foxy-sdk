import { client } from "./client";
import { enableAddToCart } from "./add-to-cart";
import { internalsOf } from "./internal";
import { enableSideCart, sideCart } from "./side-cart";

// A page may load this module twice under two URLs, such as `loader.js` next
// to `loader.js?store=...`, and each runs. `?store=` always wins; the
// hostname fallback, for the store's own pages, applies only when no store is
// set, so a second copy cannot reset the store to this page.
const store = new URL(import.meta.url).searchParams.get("store");
if (store !== null) client.setStoreDomain(store);
else if (internalsOf(client).storeUrl() === null) client.setStoreDomain(location.hostname);

enableAddToCart();
enableSideCart();

export { client, sideCart };
