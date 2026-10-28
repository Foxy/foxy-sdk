import { getTimeFromFrequency, InvalidFrequencyError } from '@foxy.io/sdk/admin/subscriptions';

try {
  getTimeFromFrequency('every week');
} catch (error) {
  if (error instanceof InvalidFrequencyError) {
    console.error(error.message); // Invalid frequency "every week".
  } else {
    throw error;
  }
}
