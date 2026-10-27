import { getResourceId } from '@foxy.io/sdk/admin';

console.log(getResourceId('https://api.foxy.io/customers/123')); // 123
console.log(getResourceId('https://api.foxy.io/stores/abc')); // 'abc'
console.log(getResourceId('not a url')); // null
