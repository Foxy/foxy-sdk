import { DoneInvokeEvent, EventObject, assign } from 'xstate';
import {
  NucleonElementContext,
  NucleonElementEvent,
  NucleonElementReloadEvent,
  NucleonElementRestoreEvent,
  NucleonElementSetGroupEvent,
  NucleonElementSetHrefEvent,
  NucleonElementSetI18NLangEvent,
  NucleonElementSetI18NNsEvent,
  NucleonElementSetParentEvent,
  NucleonElementSetPropertyEvent,
  NucleonElementSetResourceEvent,
  Resource,
} from './types';

import { NucleonAPI } from '../../API';
import { cloneDeep } from 'lodash-es';
import { isResource } from '../../utils';

export const reset = assign<NucleonElementContext, NucleonElementReloadEvent>({
  backup: null,
  errors: [],
  resource: null,
});

export const setHref = assign<NucleonElementContext, NucleonElementSetHrefEvent>({
  backup: null,
  errors: [],
  href: (ctx, evt) => (evt.type === 'SET_HREF' ? evt.data : ctx.href),
  resource: null,
});

export const setGroup = assign<NucleonElementContext, NucleonElementSetGroupEvent>({
  api: (ctx, evt) =>
    new NucleonAPI({
      base: new URL(document.baseURI),
      element: ctx.element,
      group: evt.data,
      level: 10,
    }),
  backup: null,
  errors: [],
  group: (_, evt) => evt.data,
  resource: null,
});

export const setParent = assign<NucleonElementContext, NucleonElementSetParentEvent>({
  errors: (ctx, evt) => {
    const noError = ctx.errors.filter(err => err.code !== 'link_required');
    if (evt.data || ctx.href) return noError;
    return [...ctx.errors, { code: 'link_required', type: 'fatal' }];
  },
  parent: (_, evt) => evt.data,
});

export const handleFatalError = assign<NucleonElementContext, DoneInvokeEvent<unknown>>({
  errors: ctx => [...ctx.errors, { type: 'fatal' } as const],
});

export const setPartialResource = assign<NucleonElementContext, NucleonElementSetPropertyEvent>({
  resource: (ctx: NucleonElementContext, evt: NucleonElementEvent) => {
    if (evt.type === 'SET_PROPERTY') return { ...ctx.resource, ...evt.data } as Resource;
    return ctx.resource;
  },
});

export const validateResource = assign<NucleonElementContext, NucleonElementSetPropertyEvent>({
  errors: ctx => {
    const newErrors = ctx.errors.filter(err => err.type !== 'input');

    if (ctx.resource !== null) {
      for (const target in ctx.resourceV8N) {
        for (const validate of ctx.resourceV8N[target]) {
          const code = validate(ctx.resource);

          if (typeof code === 'string') {
            newErrors.push({ code, target, type: 'input' });
            break;
          }
        }
      }
    }

    return newErrors;
  },
});

export const backupResource = assign<NucleonElementContext, NucleonElementSetPropertyEvent>({
  backup: (ctx: NucleonElementContext) => cloneDeep(ctx.resource),
});

export const restore = assign<NucleonElementContext, NucleonElementRestoreEvent>({
  backup: null,
  resource: (ctx: NucleonElementContext) => ctx.backup,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setResource = assign<NucleonElementContext, any>({
  backup: null,
  errors: [],
  href: (ctx, evt) => {
    const resource = (evt as NucleonElementSetResourceEvent).data;
    return isResource(resource) ? resource._links.self.href : ctx.href;
  },
  resource: (_: NucleonElementContext, evt: EventObject) => (evt as NucleonElementSetResourceEvent).data,
});

export const setI18NLang = assign<NucleonElementContext, NucleonElementSetI18NLangEvent>({
  i18n: ({ i18n }, { data: lang }) => {
    if (!lang || !i18n.instance) return { ...i18n, lang };
    const t = i18n.instance.getFixedT(lang, i18n.ns ?? undefined);
    return { ...i18n, lang, t };
  },
});

export const setI18NNs = assign<NucleonElementContext, NucleonElementSetI18NNsEvent>({
  i18n: ({ i18n }, { data: ns }) => {
    if (!i18n.lang || !i18n.instance) return { ...i18n, ns };
    const t = i18n.instance.getFixedT(i18n.lang, ns ?? undefined);
    return { ...i18n, ns, t };
  },
});
