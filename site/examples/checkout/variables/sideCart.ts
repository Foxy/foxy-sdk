import { sideCart } from 'https://cdn-js.foxy.io/sdk@2/checkout.js';

// The loader must be on the page: it turns the drawer on.

// Open the drawer from your own cart button.
document.querySelector('#cart-button')?.addEventListener('click', () => {
  sideCart.show();
});

// Close it when the shopper presses Escape.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') sideCart.hide();
});

// Keep a cart badge in sync with the side cart.
const badge = document.querySelector('#cart-badge');
const updateBadge = () => {
  if (badge) badge.textContent = String(sideCart.itemCount ?? 0);
};

sideCart.addEventListener('itemcountchange', updateBadge);
updateBadge();
