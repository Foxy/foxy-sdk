import * as actions from './actions';
import * as guards from './guards';
import * as services from './services';

import {
  NucleonElementContext,
  NucleonElementEvent,
  NucleonElementGuard,
  NucleonElementInit,
  NucleonElementMachine,
  Resource,
} from './types';

import { createContext } from './context';
import { createMachine } from 'xstate';

const createRequestState = <TSource>(src: TSource) => ({
  invoke: {
    onDone: { actions: actions.setResource, target: '#root.form.unknown' },
    onError: { actions: actions.handleFatalError, target: '#root.form.unknown' },
    src,
  },
});

const createTransientState = <T extends Resource>(
  map: Record<string, NucleonElementGuard<T>>,
  defaultState: string
) => ({
  always: [...Object.entries(map).map(([target, cond]) => ({ cond, target })), { target: defaultState }],
});

export const createBaseMachine = <TResource extends Resource>(
  init: NucleonElementInit
): NucleonElementMachine<TResource> =>
  createMachine<NucleonElementContext<TResource>, NucleonElementEvent<TResource>>({
    context: createContext(init),
    id: 'root',
    initial: 'unknown',
    invoke: { src: services.reflectBreakpoints },
    states: {
      form: {
        initial: 'unknown',
        on: {
          RELOAD: { actions: actions.reset, target: '.unknown' },
          SET_GROUP: { actions: actions.setGroup, target: '.unknown' },
          SET_HREF: { actions: actions.setHref, target: '.unknown' },
          SET_PARENT: { actions: actions.setParent, target: '.unknown' },
          SET_RESOURCE: { actions: actions.setResource, target: '.unknown' },
        },
        states: {
          busy: {
            initial: 'fetching',
            states: {
              creating: createRequestState(services.createResource),
              deleting: createRequestState(services.deleteResource),
              fetching: createRequestState(services.fetchResource),
              updating: createRequestState(services.updateResource),
            },
          },
          error: {},
          idle: {
            initial: 'unknown',
            states: {
              snapshot: {
                initial: 'unknown',
                invoke: { src: services.exposeResource },
                on: { DELETE: '#root.form.busy.deleting' },
                states: {
                  modified: {
                    initial: 'unknown',
                    on: {
                      RESTORE: { actions: 'restore', target: '#root.form.unknown' },
                      SET_PROPERTY: {
                        actions: [actions.setPartialResource, actions.validateResource],
                        target: 'unknown',
                      },
                    },
                    states: {
                      invalid: {},
                      unknown: createTransientState({ invalid: guards.hasInputErrors }, 'valid'),
                      valid: { on: { SUBMIT: '#root.form.busy.updating' } },
                    },
                  },
                  unknown: createTransientState({ modified: guards.hasChanges }, 'unmodified'),
                  unmodified: {
                    on: {
                      SET_PROPERTY: {
                        actions: [actions.backupResource, actions.setPartialResource, actions.validateResource],
                        target: 'unknown',
                      },
                    },
                  },
                },
              },
              template: {
                initial: 'unknown',
                on: {
                  SET_PROPERTY: {
                    actions: [actions.setPartialResource, actions.validateResource],
                    target: '#root.form.unknown',
                  },
                },
                states: {
                  invalid: {},
                  unknown: createTransientState({ invalid: guards.hasInputErrors }, 'valid'),
                  valid: { on: { SUBMIT: '#root.form.busy.creating' } },
                },
              },
              unknown: createTransientState({ snapshot: guards.hasSnapshot }, 'template'),
            },
          },
          unknown: createTransientState({ busy: guards.hasHrefOnly, error: guards.hasFatalErrors }, 'idle'),
        },
      },
      i18n: {
        initial: 'busy',
        on: {
          SET_I18N_LANG: { actions: actions.setI18NLang, target: '.busy' },
          SET_I18N_NS: { actions: actions.setI18NNs, target: '.busy' },
        },
        states: {
          busy: { invoke: { onDone: 'idle', onError: 'error', src: services.initI18N } },
          error: {},
          idle: {},
        },
      },
    },
    type: 'parallel',
  });
