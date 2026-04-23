import type { APIJson } from '../types';

export type MutableAPIJson = APIJson;

export const cloneApiJson = (json: APIJson): MutableAPIJson => structuredClone(json);

export const toMutable = <T>(value: T): T => structuredClone(value);
