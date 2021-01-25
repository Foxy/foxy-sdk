import { NucleonElementContext, NucleonElementInit, NucleonElementV8N, Resource } from './types';

import { NucleonAPI } from '../../API';

type ContextInit<TResource extends Resource> = NucleonElementInit & {
  resourceV8N?: NucleonElementV8N<TResource>;
};

export const createContext = <TResource extends Resource>(
  init: ContextInit<TResource>
): NucleonElementContext<TResource> => ({
  api: new NucleonAPI({
    base: new URL(document.baseURI),
    element: init.element,
  }),

  backup: null,
  breakpoints: init.breakpoints ?? null,
  element: init.element,
  errors: [{ code: 'link_required', type: 'fatal' }],
  href: null,

  i18n: {
    instance: null,
    lang: null,
    ns: null,
    t: (v: string) => v,
    whenReady: Promise.resolve((v: string) => v),
    ...init.i18n,
  },

  parent: null,
  resource: null,
  resourceV8N: init.resourceV8N ?? {},
});
