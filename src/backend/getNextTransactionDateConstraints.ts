import type * as Core from '../core';
import type * as Rels from './Rels';

import { getTimeFromFrequency } from './getTimeFromFrequency.js';
import jsonata from 'jsonata';

type Rules = Core.Resource<Rels.CustomerPortalSettings>['subscriptions']['allowNextDateModification'];
type Subscription = Omit<Core.Resource<Rels.Subscription>, '_links' | '_embedded'>;

export type Constraints = {
  min?: string;
  max?: string;
  disallowedDates?: string[];
  allowedDaysOfWeek?: number[];
  allowedDaysOfMonth?: number[];
};

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
export function getNextTransactionDateConstraints(data: Subscription, rules: Rules): Constraints | boolean {
  if (typeof rules === 'boolean') return rules;

  const combinedRule = rules
    .filter(rule => Boolean(jsonata(rule.jsonataQuery).evaluate(data)))
    .reduce((result, rule) => {
      if (rule.min) {
        const currentTime = result.min ? getTimeFromFrequency(result.min) : Infinity;
        const proposedTime = getTimeFromFrequency(rule.min);
        if (proposedTime < currentTime) result.min = rule.min;
      }

      if (rule.max) {
        const currentTime = result.max ? getTimeFromFrequency(result.max) : -Infinity;
        const proposedTime = getTimeFromFrequency(rule.max);
        if (proposedTime > currentTime) result.max = rule.max;
      }

      if (rule.allowedDays?.type === 'day') {
        const previousSet = result.allowedDaysOfWeek ?? [];
        const expandedSet = [...previousSet, ...rule.allowedDays.days];
        result.allowedDaysOfWeek = Array.from(new Set(expandedSet));
      }

      if (rule.allowedDays?.type === 'month') {
        const previousSet = result.allowedDaysOfMonth ?? [];
        const expandedSet = [...previousSet, ...rule.allowedDays.days];
        result.allowedDaysOfMonth = Array.from(new Set(expandedSet));
      }

      if (rule.disallowedDates) {
        const previousSet = result.disallowedDates ?? [];
        const expandedSet = [...previousSet, ...rule.disallowedDates];
        result.disallowedDates = Array.from(new Set(expandedSet));
      }

      return result;
    }, {} as Constraints);

  return Object.keys(combinedRule).length === 0 ? false : combinedRule;
}
