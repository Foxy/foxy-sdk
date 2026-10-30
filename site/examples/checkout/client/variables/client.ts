import { client } from 'https://cdn-js.foxy.io/sdk@2/checkout/client.js';

client.setStoreDomain('example.foxycart.com');

// Add a product with a quantity and a custom option.
client.addItem([
  ['name', 'Mug'],
  ['price', '15'],
  ['quantity', '2'],
  ['color', 'Blue'],
]);
