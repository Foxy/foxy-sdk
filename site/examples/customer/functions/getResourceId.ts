import { getResourceId } from 'https://cdn-js.foxy.io/sdk@2/customer.js';

console.log(getResourceId('https://example.foxycart.com/s/customer/subscriptions/123')); // 123
console.log(getResourceId('https://example.foxycart.com/s/customer/attributes/abc')); // 'abc'
console.log(getResourceId('not a url')); // null
