/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConditionPredicate, ServiceConfig, StateMachine, StateSchema } from 'xstate';
import { TFunction, i18n } from 'i18next';

import { NucleonAPI } from '../../API';

export type Resource = {
  readonly _links: {
    readonly self: {
      readonly href: string;
    };
  };
};

export type NucleonElementRestoreEvent = {
  type: 'RESTORE';
};

export type NucleonElementReloadEvent = {
  type: 'RELOAD';
};

export type NucleonElementSubmitEvent = {
  type: 'SUBMIT';
};

export type NucleonElementDeleteEvent = {
  type: 'DELETE';
};

export type NucleonElementSetHrefEvent = {
  type: 'SET_HREF';
  data: string | null;
};

export type NucleonElementSetGroupEvent = {
  type: 'SET_GROUP';
  data: string;
};

export type NucleonElementSetParentEvent = {
  type: 'SET_PARENT';
  data: string | null;
};

export type NucleonElementSetPropertyEvent<T extends Resource = any> = {
  type: 'SET_PROPERTY';
  data: Partial<T>;
};

export type NucleonElementSetResourceEvent<T extends Resource = any> = {
  type: 'SET_RESOURCE';
  data: T | null;
};

export type NucleonElementSetI18NNsEvent = {
  type: 'SET_I18N_NS';
  data: string | null;
};

export type NucleonElementSetI18NLangEvent = {
  type: 'SET_I18N_LANG';
  data: string | null;
};

export type NucleonElementSetI18NInstanceEvent = {
  type: 'SET_I18N_INSTANCE';
  data: null | {
    instance: i18n;
    whenReady: Promise<void>;
  };
};

export type NucleonElementError = {
  type: 'fatal' | 'input';
  code?: string;
  target?: string;
};

export type NucleonElementEvent<T extends Resource = any> =
  | NucleonElementReloadEvent
  | NucleonElementSubmitEvent
  | NucleonElementDeleteEvent
  | NucleonElementSetHrefEvent
  | NucleonElementRestoreEvent
  | NucleonElementSetGroupEvent
  | NucleonElementSetParentEvent
  | NucleonElementSetI18NNsEvent
  | NucleonElementSetI18NLangEvent
  | NucleonElementSetI18NInstanceEvent
  | NucleonElementSetResourceEvent<T>
  | NucleonElementSetPropertyEvent<T>;

export type NucleonElementContext<T extends Resource = any> = {
  api: NucleonAPI<any>;
  i18n: {
    whenReady: Promise<TFunction> | null;
    instance: i18n | null;
    lang: string | null;
    ns: string | null;
    t: TFunction;
  };
  href: string | null;
  group: string;
  parent: string | null; // optional parent collection uri to enable POST requests
  errors: NucleonElementError[];
  backup: T | null;
  element: HTMLElement;
  resource: T | null;
  resourceV8N: NucleonElementV8N<T>;
  breakpoints: Record<string, number> | null;
};

export type NucleonElementV8N<T extends Resource = any> = Record<string, ((r: Partial<T>) => true | string)[]>;

export type NucleonElementService<T extends Resource = any> = ServiceConfig<NucleonElementContext<T>>;

export type NucleonElementGuard<T extends Resource = any> = ConditionPredicate<
  NucleonElementContext<T>,
  NucleonElementEvent<T>
>;

export type NucleonElementSchema = StateSchema;

export type NucleonElementInit = {
  breakpoints?: Record<string, number>;
  resourceV8N?: NucleonElementV8N;
  element: HTMLElement;
  i18n?: {
    instance: i18n;
    whenReady: Promise<TFunction>;
  };
};

export type NucleonElementMachine<TResource extends Resource = any> = StateMachine<
  NucleonElementContext<TResource>,
  NucleonElementSchema,
  NucleonElementEvent<TResource>
>;

export type NucleonElementStateValue =
  | 'form.busy'
  | 'form.busy.fetching'
  | 'form.busy.creating'
  | 'form.busy.updating'
  | 'form.busy.deleting'
  | 'form.error'
  | 'form.idle'
  | 'form.idle.template'
  | 'form.idle.template.invalid'
  | 'form.idle.template.valid'
  | 'form.idle.snapshot'
  | 'form.idle.snapshot.unmodified'
  | 'form.idle.snapshot.modified'
  | 'form.idle.snapshot.modified.invalid'
  | 'form.idle.snapshot.modified.valid'
  | 'i18n.busy'
  | 'i18n.idle'
  | 'i18n.error';
