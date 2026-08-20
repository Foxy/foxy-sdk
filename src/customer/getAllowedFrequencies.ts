import type { CustomerPortalSettings } from './Graph/customer_portal_settings';
import type { Resource } from '../core/Resource/Resource';
import type { Subscription } from './Graph/subscription';
import { getAllowedFrequencies as ruleGetAllowedFrequencies } from '../rules/getAllowedFrequencies.js';

type Rules = CustomerPortalSettings['props']['subscriptions']['allow_frequency_modification'];
type Options = {
  settings: { subscriptions: { allow_frequency_modification: Rules } };
  subscription: Omit<Resource<Subscription>, '_links' | '_embedded'>;
};

/**
 * Returns allowed frequencies for given subscription and customer portal settings.
 *
 * @param opts Subscription and settings.
 * @returns Array of allowed frequencies.
 */
export function getAllowedFrequencies(opts: Options): Generator<string, void, void> {
  const allowFrequencyModification = opts.settings.subscriptions.allow_frequency_modification.map(v => ({
    jsonataQuery: v.jsonata_query,
    values: v.values,
  }));

  return ruleGetAllowedFrequencies({
    settings: { subscriptions: { allowFrequencyModification } },
    subscription: opts.subscription,
  });
}
