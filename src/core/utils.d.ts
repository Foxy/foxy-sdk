import { Graph } from './Graph';
import { Query } from './Query';

/** Same as `keyof T`, but creates an alias of `never` when given `never`. */
export type KeyOf<T> = [T] extends [never] ? never : keyof T;

/** Creates a union of record values. */
export type ValueOf<T> = T[keyof T];

/** Creates a union of required property keys. */
export type RequiredKeyOf<T> = Exclude<ValueOf<{ [K in keyof T]: T extends Record<K, T[K]> ? K : never }>, undefined>;

/** Creates a union of optional property keys. */
export type OptionalKeyOf<T> = Exclude<ValueOf<{ [K in keyof T]: T extends Record<K, T[K]> ? never : K }>, undefined>;

/** Converts union type to intersection type. */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/** Creates intersection type out of a record values union. */
export type IntersectionValueOf<T> = UnionToIntersection<ValueOf<T>>;

/** From T, pick a set of properties whose keys are in the union K, and make them required. */
export type With<T, K extends keyof T> = Pick<Required<T>, K>;

/** Same as `keyof T`, but omitting keys of properties with values resolving to `never`. */
export type AvailableKeyOf<T> = ValueOf<{ [K in keyof T]: [T[K]] extends [never] ? never : K }>;

/** From T, pick a set of properties whose values are not `never`. */
export type ExcludeNever<T> = { [K in AvailableKeyOf<T>]: T[K] };

/**
 * Takes the existing zoom query parameter value and excludes all
 * top-level zooms, zooming in on the given relation.
 */
export type ZoomIn<TZoom, TRel extends PropertyKey> = TZoom extends (infer Items)[]
  ? ValueOf<Extract<Items, Record<TRel, unknown>>>
  : TZoom extends Record<TRel, infer NestedAPINodeQueryZoom>
  ? NestedAPINodeQueryZoom
  : never;

/**
 * Zooms in on the given rel and constructs a type
 * extending `APINodeQueryZoom` for use in a query.
 */
export type ZoomOn<
  TGraph extends Graph,
  TQuery extends Query<TGraph> | undefined,
  TRel extends keyof TGraph['zooms']
> = TQuery extends With<Query<TGraph>, 'zoom'>
  ? ZoomIn<TQuery['zoom'], TRel> extends Query<Required<TGraph['zooms']>[TRel]>['zoom']
    ? ZoomIn<TQuery['zoom'], TRel>
    : never
  : never;
