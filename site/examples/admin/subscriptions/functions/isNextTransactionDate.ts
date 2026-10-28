import { isNextTransactionDate } from '@foxy.io/sdk/admin/subscriptions';

const settings = {
  subscriptions: {
    allowNextDateModification: [{ jsonataQuery: 'true', min: '1w', max: '3m' }],
  },
};

// `value` is a date in the YYYY-MM-DD format.
const isAllowed = isNextTransactionDate({ value: '2030-01-15', settings, subscription: {} });
console.log(isAllowed);
