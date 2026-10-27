import { regionLabelMessageId } from '@foxy.io/sdk/checkout';
import { client } from '@foxy.io/sdk/checkout/client';

// The label for the region field changes by country: State, Province, Prefecture.
const id = regionLabelMessageId('JP');
const label = document.createElement('label');
label.textContent = client.json?.language_strings[id] ?? 'State';
