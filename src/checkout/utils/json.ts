import type { APIJson } from '../types';
import cloneDeep from 'lodash/cloneDeep';

export type MutableAPIJson = APIJson;

export const cloneApiJson: (json: APIJson) => MutableAPIJson = cloneDeep;

export const toMutable = cloneDeep;
