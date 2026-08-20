import type { FrequencyRule, RuleSubject } from './types';
import jsonata from 'jsonata';

type Options = {
  settings: { subscriptions: { allowFrequencyModification: FrequencyRule[] } };
  subscription: RuleSubject;
};

/**
 * Returns allowed frequencies for given subscription and customer portal settings.
 *
 * @param opts Subscription and settings.
 */
export function* getAllowedFrequencies(opts: Options): Generator<string, void, void> {
  const returnedFrequencies: string[] = [];

  for (const rule of opts.settings.subscriptions.allowFrequencyModification) {
    const isRuleApplicable = !!jsonata(rule.jsonataQuery).evaluate(opts.subscription);
    if (!isRuleApplicable) continue;

    for (const frequency of rule.values) {
      const isFrequencyUnique = !returnedFrequencies.includes(frequency);
      if (!isFrequencyUnique) continue;

      returnedFrequencies.push(frequency);
      yield frequency;
    }
  }
}
