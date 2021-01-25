import { NucleonElementGuard } from './types';
import { isEqual } from 'lodash-es';

export const hasFatalErrors: NucleonElementGuard = ctx => {
  return ctx.errors.some(err => err.type === 'fatal');
};

export const hasInputErrors: NucleonElementGuard = ctx => {
  return ctx.resource === null || ctx.errors.some(err => err.type === 'input');
};

export const hasSnapshot: NucleonElementGuard = ctx => {
  return ctx.resource !== null && ctx.href !== null;
};

export const hasHrefOnly: NucleonElementGuard = ctx => {
  return ctx.href !== null && ctx.resource === null;
};

export const hasChanges: NucleonElementGuard = ctx => {
  return ctx.backup !== null && !isEqual(ctx.resource, ctx.backup);
};
