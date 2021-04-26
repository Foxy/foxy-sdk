import type { CustomerPortalSettings } from './Graph/customer_portal_settings';
import type { Resource } from '../core/Resource/Resource';
import type { Subscription } from './Graph/subscription';
import { isNextTransactionDate as backendIsNextTransactionDate } from '../backend/isNextTransactionDate.js';

type BackendParameters = Parameters<typeof backendIsNextTransactionDate>;
type BackendConfig = BackendParameters[0]['settings']['subscriptions']['allowNextDateModification'];
type Config = CustomerPortalSettings['props']['subscriptions']['allow_next_date_modification'];
type Options = {
  value: string;
  settings: { subscriptions: { allow_next_date_modification: Config } };
  subscription: Omit<Resource<Subscription>, '_links' | '_embedded'>;
};

/**
 * Checks if given date (YYYY-MM-DD) can be used as the next transaction
 * date for given subscription.
 *
 * @param opts Subscription, customer portal settings and value.
 * @returns True if given date can be used as next transaction date.
 */
export function isNextTransactionDate(opts: Options): boolean {
  const customerConfig = opts.settings.subscriptions.allow_next_date_modification;
  let allowNextDateModification: BackendConfig;

  if (typeof customerConfig === 'boolean') {
    allowNextDateModification = customerConfig;
  } else {
    allowNextDateModification = customerConfig.map(rule => ({
      allowedDays: rule.allowed_days,
      disallowedDates: rule.disallowed_dates,
      jsonataQuery: rule.jsonata_query,
      max: rule.max,
      min: rule.min,
    }));
  }

  return backendIsNextTransactionDate({
    settings: { subscriptions: { allowNextDateModification } },
    subscription: opts.subscription,
    value: opts.value,
  });
}
