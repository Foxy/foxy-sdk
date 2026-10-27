import { client } from '@foxy.io/sdk/checkout/client';

client.setStoreDomain('example.foxycart.com');

// Add a product with a quantity and a custom option.
client.addItem([
  ['name', 'Mug'],
  ['price', '15'],
  ['quantity', '2'],
  ['color', 'Blue'],
]);
