import type { SideCart } from 'https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js';
import { sideCart } from 'https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js';

// Keep a cart badge in sync with the side cart.
function bindBadge(cart: SideCart, badge: HTMLElement) {
  const update = () => {
    badge.textContent = String(cart.itemCount ?? 0);
  };

  cart.addEventListener('itemcountchange', update);
  update();
}

bindBadge(sideCart, document.createElement('span'));
