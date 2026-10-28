import { getAllowedFrequencies } from '@foxy.io/sdk/admin/subscriptions';

const settings = {
  subscriptions: {
    allowFrequencyModification: [{ jsonataQuery: 'true', values: ['1m', '3m', '1y'] }],
  },
};

// `subscription` is the subscription resource from the Admin API.
const subscription = { frequency: '1m' };

const frequencies = [...getAllowedFrequencies({ settings, subscription })];
console.log(frequencies); // ['1m', '3m', '1y']
