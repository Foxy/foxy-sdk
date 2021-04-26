import type { CustomerPortalSettings } from './Graph/customer_portal_settings';
import type { Resource } from '../core/Resource/Resource';
import type { Subscription } from './Graph/subscription';
import { getNextTransactionDateConstraints } from './getNextTransactionDateConstraints.js';
import parse from 'parse-duration';

type Config = CustomerPortalSettings['props']['subscriptions']['allowNextDateModification'];

type Options = {
  value: string;
  settings: { subscriptions: { allowNextDateModification: Config } };
  subscription: Omit<Resource<Subscription>, '_links' | '_embedded'>;
};

/**
 * Converts YYYY-MM-DD to date.
 *
 * @param yyyyMmDd Date as YYYY-MM-DD.
 * @returns Date object.
 */
function toDate(yyyyMmDd: string) {
  const [yyyy, mm, dd] = yyyyMmDd.split('-').map(v => parseInt(v));
  return new Date(yyyy, mm - 1, dd);
}

/**
 * Checks if given date (YYYY-MM-DD) can be used as the next transaction
 * date for given subscription.
 *
 * @param opts Subscription, customer portal settings and value.
 * @returns True if given date can be used as next transaction date.
 */
export function isNextTransactionDate(opts: Options): boolean {
  const valueAsDate = toDate(opts.value);
  const valueAsTime = valueAsDate.getTime();
  const constraints = getNextTransactionDateConstraints(
    opts.subscription,
    opts.settings.subscriptions.allowNextDateModification
  );

  if (typeof constraints === 'boolean') return constraints;

  if (constraints.allowedDaysOfMonth?.includes(valueAsDate.getDate()) === false) return false;

  if (constraints.allowedDaysOfWeek?.includes(valueAsDate.getDay()) === false) return false;

  if (constraints.disallowedDates) {
    const match = constraints.disallowedDates.find(dateOrRange => {
      const [from, to] = dateOrRange.split('..').map(v => toDate(v).getTime());
      return valueAsTime === from || (to !== undefined && valueAsTime >= from && valueAsTime <= to);
    });

    if (match) return false;
  }

  if (constraints.min) {
    const duration = parse(constraints.min);
    if (duration !== null && Date.now() + duration >= valueAsTime) return false;
  }

  if (constraints.max) {
    const duration = parse(constraints.max);
    if (duration !== null && Date.now() + duration <= valueAsTime) return false;
  }

  return true;
}
