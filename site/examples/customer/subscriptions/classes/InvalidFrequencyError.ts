import { getTimeFromFrequency, InvalidFrequencyError } from 'https://cdn-js.foxy.io/sdk@2/customer/subscriptions.js';

try {
  getTimeFromFrequency('every week');
} catch (error) {
  if (error instanceof InvalidFrequencyError) {
    console.error(error.message); // Invalid frequency "every week".
  } else {
    throw error;
  }
}
