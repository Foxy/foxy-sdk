import { toCountryOptions } from '@foxy.io/sdk/checkout';
import { client } from '@foxy.io/sdk/checkout/client';

const shipment = client.json?.shipments[0];
const select = document.createElement('select');

// Names are localized and sorted for the locale you pass.
for (const { value, label } of toCountryOptions(shipment?.country_options, 'en-US')) {
  select.append(new Option(label, value));
}
