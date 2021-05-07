/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */

import { ConditionPredicate, DoneInvokeEvent } from 'xstate';
import type { Context, Event } from './types';

/** XState guard that passes when context includes resource data. */
export const hasData: ConditionPredicate<Context, Event> = ctx => ctx.data !== null;

/** XState guard that passes when context includes pending changes to resource data. */
export const hasEdits: ConditionPredicate<Context, Event> = ctx => ctx.edits !== null;

/** XState guard that passes when context includes validation errors. */
export const hasErrors: ConditionPredicate<Context, Event> = ctx => ctx.errors.length > 0;

/** XState guard that passes when invoke.done event data is an array. */
export const isV8nErrorEvent: ConditionPredicate<Context, Event> = (_, evt) => {
  return Array.isArray((evt as DoneInvokeEvent<unknown[]>).data);
};
