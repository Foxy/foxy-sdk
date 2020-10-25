export interface Graph {
  curie: string;
  links: any;
  props: any;
  zooms?: any;
  child?: Graph;
}

export type Properties<G extends Graph> = G["props"];
export type Curies<G extends Graph> = keyof G["links"];
export type Follow<G extends Graph, C extends Curies<G>> = G["links"][C];

type QueryZoomString<TGraph extends Graph> = keyof Required<TGraph["zooms"]>;

type QueryZoomRecord<TGraph extends Graph> = {
  readonly [Rel in keyof Required<TGraph["zooms"]>]?: QueryZoom<Required<TGraph["zooms"]>[Rel]>;
};

type QueryZoom<TGraph extends Graph> = Required<TGraph["zooms"]> extends Record<string, Graph>
  ? QueryZoomString<TGraph> | QueryZoomRecord<TGraph> | readonly (QueryZoomString<TGraph> | QueryZoomRecord<TGraph>)[]
  : never;

type QueryOrder<TGraph extends Graph> =
  | keyof TGraph["props"]
  | (keyof TGraph["props"] | { readonly [K in keyof TGraph["props"]]?: "asc" | "desc" })[]
  | { readonly [K in keyof TGraph["props"]]?: "asc" | "desc" };

type QueryFields<TGraph extends Graph> = readonly (keyof TGraph["props"])[];

export type Query<TGraph extends Graph> = TGraph["child"] extends Graph
  ? {
      readonly zoom?: QueryZoom<TGraph["child"]>;
      readonly order?: QueryOrder<TGraph["child"]>;
      readonly limit?: number;
      readonly fields?: QueryFields<TGraph["child"]>;
      readonly offset?: number;
      // readonly filters?: any; TODO
    }
  : {
      readonly zoom?: QueryZoom<TGraph>;
      readonly fields?: QueryFields<TGraph>;
    };

type ObjectValues<Value> = Value[keyof Value];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type RequiredPropertyOf<T> = Exclude<{ [K in keyof T]: T extends Record<K, T[K]> ? K : never }[keyof T], undefined>;
type IntersectionOfValues<T> = UnionToIntersection<ObjectValues<T>>;
type ArrayItem<T> = T extends (infer U)[] ? U : never;
type KeyOf<T> = [T] extends [never] ? never : keyof T;

/**
 * Constructs a union type by the following rules:
 *
 * - leave string literals as-is
 * - transform records to the unions of their keys, omitting the nested values
 * - extract item type from arrays and transform it by the 2 rules above
 *
 * @template T Any complex record, array or string type.
 */
type Flatten<T> = T extends string
  ? T
  : T extends (infer U)[]
  ? Extract<U, string> | KeyOf<Extract<U, Record<string, any>>>
  : T extends Record<string, any>
  ? keyof T
  : never;

/**
 * Constructs a new zoom union type from the given one by going
 * one level down from the provided curie.
 *
 * @template TQueryZoom Original zoom union type to operate on.
 * @template TRel Relation to zoom in on.
 */
type ZoomIn<TQueryZoom, TRel extends PropertyKey> = TQueryZoom extends (infer ArrayItem)[]
  ? ObjectValues<Extract<ArrayItem, Record<TRel, any>>>
  : TQueryZoom extends Record<TRel, infer NestedZoom>
  ? NestedZoom
  : never;

type Links<TGraph extends Graph> = {
  _links: {
    [TLink in keyof TGraph["links"]]: {
      templated?: boolean;
      title?: string;
      name?: string;
      href: string;
    };
  };
};

type FullResponse<TGraph extends Graph> = TGraph["props"];

type PartialResponse<TGraph extends Graph, TQuery> = TQuery extends Query<TGraph>
  ? [ArrayItem<TQuery["fields"]>] extends [never]
    ? TGraph["props"]
    : ArrayItem<TQuery["fields"]> extends keyof TGraph["props"]
    ? Pick<TGraph["props"], ArrayItem<TQuery["fields"]>>
    : TGraph["props"]
  : TGraph["props"];

type CollectionItems<TGraph extends Graph, TQuery> = TGraph["child"] extends Graph
  ? { _embedded: Record<TGraph["curie"], ResponseJSON<TGraph["child"], TQuery>[]> }
  : unknown;

type ZoomedResources<TGraph extends Graph, TQuery> = TQuery extends Query<TGraph>
  ? {
      _embedded: IntersectionOfValues<
        {
          [TRel in Flatten<TQuery["zoom"]> | RequiredPropertyOf<TGraph["zooms"]>]: Record<
            Required<TGraph["zooms"]>[TRel]["curie"],
            Required<TGraph["zooms"]>[TRel]["child"] extends Graph
              ? ResponseJSON<Required<TGraph["zooms"]>[TRel]["child"], { zoom: ZoomIn<TQuery["zoom"], TRel> }>[]
              : ResponseJSON<Required<TGraph["zooms"]>[TRel], { zoom: ZoomIn<TQuery["zoom"], TRel> }>
          >;
        }
      >;
    }
  : {
      _embedded: IntersectionOfValues<
        {
          [TRel in RequiredPropertyOf<TGraph["zooms"]>]: Record<
            Required<TGraph["zooms"]>[TRel]["curie"],
            Required<TGraph["zooms"]>[TRel]["child"] extends Graph
              ? ResponseJSON<Required<TGraph["zooms"]>[TRel]["child"]>[]
              : ResponseJSON<Required<TGraph["zooms"]>[TRel]>
          >;
        }
      >;
    };

export type ResponseJSON<TGraph extends Graph, TQuery = undefined> = Links<TGraph> &
  (TGraph["child"] extends Graph ? FullResponse<TGraph> : PartialResponse<TGraph, TQuery>) &
  (TGraph["child"] extends Graph ? CollectionItems<TGraph, TQuery> : ZoomedResources<TGraph, TQuery>);
