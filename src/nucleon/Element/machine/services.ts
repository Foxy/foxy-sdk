import { NucleonElementContext, NucleonElementService } from './types';

export const fetchResource: NucleonElementService = async (ctx: NucleonElementContext) => {
  const response = await ctx.api.fetch(ctx.href as string, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

export const createResource: NucleonElementService = async (ctx: NucleonElementContext) => {
  const response = await ctx.api.fetch(ctx.parent as string, {
    body: JSON.stringify(ctx.resource),
    method: 'POST',
  });

  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

export const updateResource: NucleonElementService = async (ctx: NucleonElementContext) => {
  const response = await ctx.api.fetch(ctx.href as string, {
    body: JSON.stringify(ctx.resource),
    method: 'PATCH',
  });

  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

export const deleteResource: NucleonElementService = async (ctx: NucleonElementContext) => {
  const response = await ctx.api.fetch(ctx.href as string, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error(response.statusText);
  return null;
};

export const exposeResource: NucleonElementService = ctx => send => {
  const unexpose = ctx.api?.expose({
    add: () => send({ type: 'RELOAD' }),
    get: () => ctx.resource,
    set: data => send({ data, type: 'SET_RESOURCE' }),
  });

  return unexpose;
};

export const reflectBreakpoints: NucleonElementService = ({ breakpoints, element }) => () => {
  if (!breakpoints) return;

  const resizeObserver = new ResizeObserver(([entry]) => {
    const newValue = Object.entries(breakpoints)
      .filter(([, minWidth]) => entry.contentRect.width >= minWidth)
      .map(([breakpoint]) => breakpoint)
      .join(' ');

    element.setAttribute('breakpoint', newValue);
  });

  resizeObserver.observe(element);
  return () => resizeObserver.disconnect();
};

export const initI18N: NucleonElementService = async ctx => {
  if (ctx.i18n.instance) {
    await ctx.i18n.whenReady;
    await Promise.all([
      ctx.i18n.lang ? ctx.i18n.instance.loadLanguages(ctx.i18n.lang) : Promise.resolve(),
      ctx.i18n.ns ? ctx.i18n.instance.loadNamespaces(ctx.i18n.ns) : Promise.resolve(),
    ]);
  }
};
