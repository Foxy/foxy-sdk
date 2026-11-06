import { client, regionLabelMessageId } from 'https://cdn-js.foxy.io/sdk@2/checkout.js';

// The label for the region field changes by country: State, Province, Prefecture.
const id = regionLabelMessageId('JP');
const label = document.createElement('label');
label.textContent = client.json?.language_strings[id] ?? 'State';
