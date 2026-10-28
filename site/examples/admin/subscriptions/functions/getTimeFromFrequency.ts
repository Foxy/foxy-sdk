import { getTimeFromFrequency } from '@foxy.io/sdk/admin/subscriptions';

// Returns milliseconds. A month is 31 days and a year is 365 days.
const week = getTimeFromFrequency('1w'); // 604800000
const twoMonths = getTimeFromFrequency('2m');
console.log(week, twoMonths);
