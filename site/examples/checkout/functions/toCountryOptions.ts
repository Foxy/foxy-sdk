import { toCountryOptions } from 'https://cdn-js.foxy.io/sdk@2/checkout.js';
import { client } from 'https://cdn-js.foxy.io/sdk@2/checkout/client.js';

const shipment = client.json?.shipments[0];
const select = document.createElement('select');

// Names are localized and sorted for the locale you pass.
for (const { value, label } of toCountryOptions(shipment?.country_options, 'en-US')) {
  select.append(new Option(label, value));
}
