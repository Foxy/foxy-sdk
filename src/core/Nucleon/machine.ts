import * as actions from './actions.js';
import * as guards from './guards.js';

import type { Context, Event, State } from './types';

import { createMachine } from 'xstate';

export const machine = createMachine<Context, Event, State>(
  {
    context: {
      data: null,
      edits: null,
      errors: [],
      failure: null,
    },
    entry: ['validate'],
    id: 'nucleon',
    initial: 'init',
    on: {
      DELETE: { actions: ['clearData', 'clearEdits', 'clearErrors'], target: '#nucleon.busy.deleting' },
      FETCH: { actions: ['clearData', 'clearEdits', 'clearErrors'], target: '#nucleon.busy.fetching' },
      SET_DATA: { actions: ['setData', 'clearEdits', 'clearErrors'], target: '#nucleon.init' },
    },
    states: {
      busy: {
        states: {
          creating: {
            invoke: {
              onDone: { actions: ['setData', 'clearEdits', 'validate'], target: '#nucleon.idle.snapshot' },
              onError: [
                { actions: 'setErrors', cond: 'isV8nErrorEvent', target: '#nucleon.idle' },
                { actions: 'setFailure', target: '#nucleon.fail' },
              ],
              src: 'sendPost',
            },
          },
          deleting: {
            invoke: {
              onDone: { actions: ['clearData', 'clearEdits', 'validate'], target: '#nucleon.idle.template' },
              onError: [
                { actions: 'setErrors', cond: 'isV8nErrorEvent', target: '#nucleon.idle' },
                { actions: 'setFailure', target: '#nucleon.fail' },
              ],
              src: 'sendDelete',
            },
          },
          fetching: {
            invoke: {
              onDone: { actions: ['setData', 'clearErrors', 'validate'], target: '#nucleon.idle.snapshot' },
              onError: [
                { actions: 'setErrors', cond: 'isV8nErrorEvent', target: '#nucleon.idle' },
                { actions: 'setFailure', target: '#nucleon.fail' },
              ],
              src: 'sendGet',
            },
          },
          updating: {
            invoke: {
              onDone: { actions: ['setData', 'clearEdits', 'validate'], target: '#nucleon.idle.snapshot' },
              onError: [
                { actions: 'setErrors', cond: 'isV8nErrorEvent', target: '#nucleon.idle' },
                { actions: 'setFailure', target: '#nucleon.fail' },
              ],
              src: 'sendPatch',
            },
          },
        },
      },
      fail: {
        exit: 'clearFailure',
      },
      idle: {
        initial: 'unknown',
        on: { EDIT: { actions: ['applyEdit', 'validate'], target: '.unknown' } },
        states: {
          snapshot: {
            initial: 'unknown',
            states: {
              clean: {
                initial: 'unknown',
                states: {
                  invalid: {},
                  unknown: { always: [{ cond: 'hasErrors', target: 'invalid' }, { target: 'valid' }] },
                  valid: {},
                },
              },
              dirty: {
                initial: 'unknown',
                on: {
                  UNDO: {
                    actions: ['clearEdits', 'clearErrors', 'validate'],
                    target: '#nucleon.idle.snapshot.clean',
                  },
                },
                states: {
                  invalid: {},
                  unknown: { always: [{ cond: 'hasErrors', target: 'invalid' }, { target: 'valid' }] },
                  valid: { on: { SUBMIT: { target: '#nucleon.busy.updating' } } },
                },
              },
              unknown: {
                always: [{ cond: 'hasEdits', target: 'dirty' }, { target: 'clean' }],
              },
            },
          },
          template: {
            initial: 'unknown',
            states: {
              clean: {
                initial: 'unknown',
                states: {
                  invalid: {},
                  unknown: { always: [{ cond: 'hasErrors', target: 'invalid' }, { target: 'valid' }] },
                  valid: {},
                },
              },
              dirty: {
                initial: 'unknown',
                on: {
                  UNDO: {
                    actions: ['clearEdits', 'clearErrors', 'validate'],
                    target: '#nucleon.idle.template.clean',
                  },
                },
                states: {
                  invalid: {},
                  unknown: { always: [{ cond: 'hasErrors', target: 'invalid' }, { target: 'valid' }] },
                  valid: { on: { SUBMIT: { target: '#nucleon.busy.creating' } } },
                },
              },
              unknown: {
                always: [{ cond: 'hasEdits', target: 'dirty' }, { target: 'clean' }],
              },
            },
          },
          unknown: {
            always: [{ cond: 'hasData', target: 'snapshot' }, { target: 'template' }],
          },
        },
      },
      init: {
        always: [{ cond: 'hasData', target: 'idle.snapshot' }, { target: 'idle.template' }],
      },
    },
  },
  {
    actions,
    guards,
  }
);
