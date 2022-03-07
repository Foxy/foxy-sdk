/** Nucleon state machine data. */
export type Data = Record<string, unknown>;

/**
 * Nucleon state machine context.
 *
 * @see https://xstate.js.org/docs/guides/typescript.html#using-typescript
 * @template TData Type of data stored in the context, usually a hypermedia resource.
 * @template TError Type of error returned by the `validate` action.
 * @template TFailure Type of non-validation error thrown in request services.
 */
export type Context<TData extends Data = Data, TError = unknown, TFailure = unknown> = {
  /** Unmodified API resource snapshot. Can be `null` before it's loaded or once it's deleted. */
  data: TData | null;
  /** Local changes to the API resource snapshot. Can be `null` before resource is loaded or once it's deleted.  */
  edits: Partial<TData> | null;
  /** Form validation errors returned by the `validate` action or with request rejection. */
  errors: TError[];
  /** Request rejection info in `fail` state when it's unrelated to form validation. */
  failure: TFailure | null;
};

/**
 * Nucleon state machine event.
 *
 * @see https://xstate.js.org/docs/guides/typescript.html#using-typescript
 * @template TData Type of data stored in the context, usually a hypermedia resource.
 */
export type Event<TData extends Data = Data> =
  | { type: 'SET_DATA'; data: TData | null }
  | { type: 'REFRESH' }
  | { type: 'EDIT'; data: Partial<TData> }
  | { type: 'UNDO' }
  | { type: 'FETCH' }
  | { type: 'DELETE' }
  | { type: 'SUBMIT' };

/**
 * Nucleon state machine [typestate](https://xstate.js.org/docs/guides/typescript.html#typestates).
 *
 * @template TData Type of data stored in the context, usually a hypermedia resource.
 * @template TError Type of error returned by the `validate` action.
 */
export type State<TData extends Data = Data, TError = unknown, TFailure = unknown> =
  | {
      value: 'fail';
      context: Context<TData, TError> & { failure: TFailure };
    }
  | {
      value: 'busy';
      context: Context<TData, TError> & { failure: null };
    }
  | {
      value: { busy: 'fetching' };
      context: Context<TData, TError> & { failure: null };
    }
  | {
      value: { busy: 'creating' };
      context: Context<TData, TError> & { data: null; edits: Partial<TData>; failure: null };
    }
  | {
      value: { busy: 'updating' };
      context: Context<TData, TError> & { data: TData; edits: Partial<TData>; failure: null };
    }
  | {
      value: { busy: 'deleting' };
      context: Context<TData, TError> & { data: TData; failure: null };
    }
  | {
      value: 'idle';
      context: Context<TData, TError> & { failure: null };
    }
  | {
      value: { idle: 'snapshot' };
      context: Context<TData, TError> & { data: TData; failure: null };
    }
  | {
      value: { idle: { snapshot: 'clean' } };
      context: Context<TData, TError> & { data: TData; edits: null; failure: null };
    }
  | {
      value: { idle: { snapshot: { clean: 'valid' } } };
      context: Context<TData, TError> & { data: TData; edits: null; failure: null };
    }
  | {
      value: { idle: { snapshot: { clean: 'invalid' } } };
      context: Context<TData, TError> & { data: TData; edits: null; failure: null };
    }
  | {
      value: { idle: { snapshot: 'dirty' } };
      context: Context<TData, TError> & { data: TData; edits: Partial<TData>; failure: null };
    }
  | {
      value: { idle: { snapshot: { dirty: 'valid' } } };
      context: Context<TData, TError> & { data: TData; edits: Partial<TData>; failure: null };
    }
  | {
      value: { idle: { snapshot: { dirty: 'invalid' } } };
      context: Context<TData, TError> & { data: TData; edits: Partial<TData>; failure: null };
    }
  | {
      value: { idle: 'template' };
      context: Context<TData, TError> & { data: null; failure: null };
    }
  | {
      value: { idle: { template: 'clean' } };
      context: Context<TData, TError> & { data: null; edits: null; failure: null };
    }
  | {
      value: { idle: { template: { clean: 'valid' } } };
      context: Context<TData, TError> & { data: null; edits: null; failure: null };
    }
  | {
      value: { idle: { template: { clean: 'invalid' } } };
      context: Context<TData, TError> & { data: null; edits: null; failure: null };
    }
  | {
      value: { idle: { template: 'dirty' } };
      context: Context<TData, TError> & { data: null; edits: Partial<TData>; failure: null };
    }
  | {
      value: { idle: { template: { dirty: 'valid' } } };
      context: Context<TData, TError> & { data: null; edits: Partial<TData>; failure: null };
    }
  | {
      value: { idle: { template: { dirty: 'invalid' } } };
      context: Context<TData, TError> & { data: null; edits: Partial<TData>; failure: null };
    };
