import { loadRegionMessages, toRegionOptions } from '@foxy.io/sdk/checkout';
import { client } from '@foxy.io/sdk/checkout/client';

const shipment = client.json?.shipments[0];
const messages = await loadRegionMessages('en-US');
const select = document.createElement('select');

// Send `value` back to the API. Show the name from the catalog.
for (const { value, messageId } of toRegionOptions(shipment?.region_options, 'US')) {
  select.append(new Option(messages[messageId] ?? value, value));
}
