/**
 * Nucleon is a generic state machine for performing CRUD operations on a resource.
 *
 * ## States
 *
 * - `idle` - resource can be edited;
 *   - `template` - this is a new resource, `context.data` is `null`;
 *     - `clean` - no edits have been made, `context.edits` is null;
 *       - `valid` - `actions.validate` allows submitting empty template with `services.sendPost`;
 *       - `invalid` - `actions.validate` disallows submitting empty template with `services.sendPost`;
 *     - `dirty` - template has been edited, `context.edits` is not `null`;
 *       - `valid` - `actions.validate` allows submitting template with `services.sendPost`;
 *       - `invalid` - `actions.validate` disallows submitting template with `services.sendPost`;
 *   - `snapshot` - this is an existing resource stored in `context.data`;
 *     - `clean` - no edits have been made, `context.edits` is null;
 *       - `valid` - `actions.validate` allows sending PATCH with no changes using `services.sendPatch`;
 *       - `invalid` - `actions.validate` requires changes before submitting changes with `services.sendPatch`;
 *     - `dirty` - existing resource has been edited, `context.edits` is not `null`;
 *       - `valid` - `actions.validate` allows submitting edits with `services.sendPatch`;
 *       - `invalid` - `actions.validate` disallows submitting edits with `services.sendPatch`;
 * - `busy` - CRUD operation is in progress;
 *   - `fetching` - `services.sendGet` is loading the resource;
 *   - `creating` - `services.sendPost` is creating the resource;
 *   - `updating` - `services.sendPatch` is updating the resource;
 *   - `deleting` - `services.sendDelete` is deleting the resource;
 * - `fail` - one of the CRUD operations has failed
 *
 * ## Context
 *
 * - `data` - loaded resource or `null`;
 * - `edits` - changes to the resource in `context.data`;
 * - `errors` - array of validation errors, format defined by `actions.validate`;
 *
 * ## Events
 *
 * - `SET_DATA` - sets `context.data` and transitions to the appropriate template or snapshot state;
 * - `EDIT` (idle only) - adds an edit to `context.edits` and transitions to the appropriate valid or invalid state;
 * - `UNDO` (idle only) - removes all edits and transitions to the appropriate valid or invalid state;
 * - `FETCH` - loads a resource by transitioning to `busy.fetching` and running `services.sendGet`;
 * - `DELETE` - deletes a resource by transitioning to `busy.deleting` and running `services.sendDelete`;
 * - `SUBMIT` (valid only) - updates or creates a resource;
 *
 * ## Actions:
 *
 * - `validate` - runs every time resource changes, put your v8n logic there;
 *
 * ## Services
 *
 * - `sendGet` - fetches resource snapshot, returning parsed JSON or throwing an error;
 * - `sendPost` - creates a resource, returning its parsed JSON or throwing an error;
 * - `sendPatch` - updates a resource, returning its full parsed JSON or throwing an error;
 * - `sendDelete` - deletes a resource, returning anything or throwing an error;
 *
 * @packageDocumentation
 *
 */

export type { Context } from './types';
export type { Event } from './types';
export type { State } from './types';

export { machine } from './machine.js';
