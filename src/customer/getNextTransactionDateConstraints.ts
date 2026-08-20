import type { Constraints } from '../rules/types';
import type { CustomerPortalSettings } from './Graph/customer_portal_settings';
import type { Resource } from '../core/Resource/Resource';
import type { Subscription } from './Graph/subscription';
import { getNextTransactionDateConstraints as ruleUtility } from '../rules/getNextTransactionDateConstraints.js';

type RuleRules = Parameters<typeof ruleUtility>[1];
type Rules = Resource<CustomerPortalSettings>['subscriptions']['allow_next_date_modification'];
type Data = Omit<Resource<Subscription>, '_links' | '_embedded'>;

/**
 * Finds which next transaction date modification rules are applicable to
 * the given subscription and merges them together.
 *
 * @param data Subscription to generate constraints for.
 * @param rules Next date modification config from the customer portal settings.
 *
 * @returns
 * Returns true if all modifications are allowed, false if next date can't
 * be changed by the customer, object with constraints in any other case.
 */
export function getNextTransactionDateConstraints(data: Data, rules: Rules): Constraints | boolean {
  let ruleRules: RuleRules;

  if (typeof rules === 'boolean') {
    ruleRules = rules;
  } else {
    ruleRules = rules.map(rule => ({
      allowedDays: rule.allowed_days,
      disallowedDates: rule.disallowed_dates,
      jsonataQuery: rule.jsonata_query,
      max: rule.max,
      min: rule.min,
    }));
  }

  return ruleUtility(data, ruleRules);
}
