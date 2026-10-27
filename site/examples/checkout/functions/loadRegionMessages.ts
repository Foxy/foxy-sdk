import { loadRegionMessages, toRegionOptions } from '@foxy.io/sdk/checkout';

// Load the region names once. Later calls use the cached catalog.
const messages = await loadRegionMessages('en-US');

for (const { messageId } of toRegionOptions(['CA', 'NY'], 'US')) {
  console.log(messages[messageId]);
}
