import type { Context, Event } from './types';

import { assign } from 'xstate';

/** XState action that clears all validation errors. */
export const clearErrors = assign<Context, Event>({ errors: [] });

/** XState action that undoes all local changes to the resource. */
export const clearEdits = assign<Context, Event>({ edits: null });

/** XState action that removes resource snapshot. */
export const clearData = assign<Context, Event>({ data: null });

/** Placeholder for XState action that validates data and changes to it, setting errors array. */
export const validate = clearErrors;

/** XState action that stores resource data passed with SET_DATA event. */
export const setData = assign<Context, Event>({
  data: (_, evt) => (evt as { data: Record<string, unknown> | null }).data,
});

/** XState action that updates context with values from partial resource passed with EDIT event. */
export const applyEdit = assign<Context, Event>({
  edits: (ctx, evt) => ({ ...ctx.edits, ...(evt as { data: Partial<Record<string, unknown>> }).data }),
});
