import { CustomerPortalSettings } from './Graph/customer_portal_settings';
import jsonata from 'jsonata';
import parse from 'parse-duration';

type Config = CustomerPortalSettings['props']['subscriptions']['allowNextDateModification'];

type Options = {
  value: string;
  settings: { subscriptions: { allowNextDateModification: Config } };
  subscription: unknown;
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
  const config = opts.settings.subscriptions.allowNextDateModification;
  if (typeof config === 'boolean') return config;

  const valueAsDate = toDate(opts.value);
  const valueAsTime = valueAsDate.getTime();

  const match = config.find(rule => {
    if (!jsonata(rule.jsonataQuery).evaluate(opts.subscription)) return false;

    if (rule.disallowedDates) {
      const match = rule.disallowedDates.find(dateOrRange => {
        const [from, to] = dateOrRange.split('..').map(v => toDate(v).getTime());
        return valueAsTime === from || (to !== undefined && valueAsTime >= from && valueAsTime <= to);
      });

      if (match) return false;
    }

    if (rule.allowedDays?.type === 'month') {
      if (!rule.allowedDays.days.includes(valueAsDate.getDate())) return false;
    }

    if (rule.allowedDays?.type === 'day') {
      if (!rule.allowedDays.days.includes(valueAsDate.getDay())) return false;
    }

    if (rule.min) {
      const duration = parse(rule.min);
      if (duration !== null && Date.now() + duration >= valueAsTime) return false;
    }

    if (rule.max) {
      const duration = parse(rule.max);
      if (duration !== null && Date.now() + duration <= valueAsTime) return false;
    }

    return true;
  });

  return !!match;
}
