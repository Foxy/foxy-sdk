import { getTimeFromFrequency } from 'https://cdn-js.foxy.io/sdk@2/customer/subscriptions.js';

// Returns milliseconds. A month is 31 days and a year is 365 days.
const week = getTimeFromFrequency('1w'); // 604800000
const twoMonths = getTimeFromFrequency('2m');
console.log(week, twoMonths);
