import type { NextDateRules } from '@foxy.io/sdk/admin/subscriptions';
import { getNextTransactionDateConstraints } from '@foxy.io/sdk/admin/subscriptions';

// Rules come from the store settings. A rule applies when its `jsonataQuery` matches.
const rules: NextDateRules = [
  { jsonataQuery: 'true', min: '1w', max: '3m', allowedDays: { type: 'day', days: [1, 3] } },
];

const constraints = getNextTransactionDateConstraints({ frequency: '1m' }, rules);
console.log(constraints); // { min: '1w', max: '3m', allowedDaysOfWeek: [1, 3] }
