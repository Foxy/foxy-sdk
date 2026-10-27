import type { SideCart } from '@foxy.io/sdk/checkout/side-cart';
import { sideCart } from '@foxy.io/sdk/checkout/side-cart';

// Keep a cart badge in sync with the side cart.
function bindBadge(cart: SideCart, badge: HTMLElement) {
  const update = () => {
    badge.textContent = String(cart.itemCount ?? 0);
  };

  cart.addEventListener('itemcountchange', update);
  update();
}

bindBadge(sideCart, document.createElement('span'));
