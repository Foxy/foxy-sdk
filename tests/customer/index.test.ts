import * as Customer from '../../src/customer';

import { API } from '../../src/customer/API';
import { getAllowedFrequencies } from '../../src/customer/getAllowedFrequencies';
import { getNextTransactionDateConstraints } from '../../src/backend/getNextTransactionDateConstraints';
import { getTimeFromFrequency } from '../../src/backend/getTimeFromFrequency';
import { isNextTransactionDate } from '../../src/customer/isNextTransactionDate';

describe('Customer', () => {
  it('exports API', () => {
    expect(Customer).toHaveProperty('API', API);
  });

  it('exports getAllowedFrequencies', () => {
    expect(Customer).toHaveProperty('getAllowedFrequencies', getAllowedFrequencies);
  });

  it('exports getNextTransactionDateConstraints', () => {
    expect(Customer).toHaveProperty('getNextTransactionDateConstraints', getNextTransactionDateConstraints);
  });

  it('exports getTimeFromFrequency', () => {
    expect(Customer).toHaveProperty('getTimeFromFrequency', getTimeFromFrequency);
  });

  it('exports isNextTransactionDate', () => {
    expect(Customer).toHaveProperty('isNextTransactionDate', isNextTransactionDate);
  });
});
