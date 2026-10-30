import { sideCart } from 'https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js';

// Open the drawer from your own cart button.
document.querySelector('#cart-button')?.addEventListener('click', () => {
  sideCart.show();
});

// Close it when the shopper presses Escape.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') sideCart.hide();
});
