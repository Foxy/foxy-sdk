/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */

import { Context, Event } from './types';

import { ConditionPredicate } from 'xstate';

/** XState guard that passes when context includes resource data. */
export const hasData: ConditionPredicate<Context, Event> = ctx => ctx.data !== null;

/** XState guard that passes when context includes pending changes to resource data. */
export const hasEdits: ConditionPredicate<Context, Event> = ctx => ctx.edits !== null;

/** XState guard that passes when context includes validation errors. */
export const hasErrors: ConditionPredicate<Context, Event> = ctx => ctx.errors.length > 0;
