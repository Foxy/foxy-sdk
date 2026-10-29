import { getResourceId } from '@foxy.io/sdk/customer';

console.log(getResourceId('https://example.foxycart.com/s/customer/subscriptions/123')); // 123
console.log(getResourceId('https://example.foxycart.com/s/customer/attributes/abc')); // 'abc'
console.log(getResourceId('not a url')); // null
