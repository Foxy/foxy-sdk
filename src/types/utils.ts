/* eslint-disable @typescript-eslint/ban-types */

import { Relations } from "./api/relations";
import { Zoomable } from "./api/zoomable";
import { DefaultZoom } from "./api/zoomable";
import { Collections } from "./api/collections";
import { Props } from "./api/props";

export type HTTPMethod = "GET" | "PUT" | "HEAD" | "POST" | "PATCH" | "DELETE" | "OPTIONS";
export type HTTPMethodWithBody = "PUT" | "POST" | "PATCH";

export type PathMember = string | number | symbol;

export type ArrayItem<T extends { [key: number]: any }> = T[number];
export type OptionalArray<T = PropertyKey> = readonly T[] | never;
export type OptionalProperty<K extends PropertyKey, V> = [V] extends [never] ? {} : Record<K, V>;
export type ObjectValues<Value> = Value[keyof Value];
export type NeverIfUndefined<T> = T extends undefined ? never : T;

/**
 * Transforms a record type by constructing another record where each
 * value is mapped to the corresponding key.
 *
 * @template T Any record type to be reverse-mapped.
 * @see https://stackoverflow.com/a/52518624
 */
export type Reverse<T extends Record<keyof T, keyof any>> = {
  [K in T[keyof T]]: { [P in keyof T]: K extends T[P] ? P : never }[keyof T];
};

/**
 * Constructs a union type by the following rules:
 *
 * - leave string literals as-is
 * - transform records to the unions of their keys, omitting the nested values
 * - extract item type from arrays and transform it by the 2 rules above
 *
 * @template T Any complex record, array or string type.
 */
export type Flatten<T> = T extends PropertyKey
  ? T
  : T extends (infer U)[]
  ? Extract<U, PropertyKey> | keyof Extract<U, Record<PropertyKey, any>>
  : T extends {}
  ? keyof T
  : never;

/**
 * Hypermedia link object included in JSON response
 * under the `_links` property.
 */
export interface HalLink {
  href: string;
  templated?: boolean;
  title?: string;
  name?: string;
}

/**
 * Constructs a helper record type describing possible zoom
 * parameter values for given curie.
 *
 * @template Curie Compact URI of the relation to construct this type for.
 */
type ZoomRecord<Curie extends keyof Zoomable> = {
  [Relation in keyof Zoomable[Curie]]?: Relation extends keyof Relations
    ? ZoomUnion<Relations[Relation]>
    : never;
};

/**
 * Constructs a union type describing possible zoom parameter values
 * for given curie. Zoom can be expressed as string, object and array.
 *
 * @template Curie Compact URI of the relation to construct this type for.
 */
export type ZoomUnion<Curie> = Curie extends keyof Zoomable
  ? keyof Zoomable[Curie] | ZoomRecord<Curie> | (keyof Zoomable[Curie] | ZoomRecord<Curie>)[]
  : never;

/**
 * Constructs a union type describing the curies included in the given
 * zoom union excluding the nested relations.
 *
 * @template ZoomUnion Zoom union to get 0-level curies for.
 */
export type ZoomCuries<ZoomUnion> = keyof Reverse<
  Pick<Relations, Extract<keyof Relations, Flatten<ZoomUnion>>>
>;

/**
 * Constructs a new zoom union type from the given one by going
 * one level down from the provided curie.
 *
 * @template ZoomUnion Original zoom union type to operate on.
 * @template Relation Relation to zoom in on.
 */
export type ZoomIn<ZoomUnion, Relation extends PropertyKey> = ZoomUnion extends (infer ArrayItem)[]
  ? ObjectValues<Extract<ArrayItem, Record<Relation, any>>>
  : ZoomUnion extends Record<Relation, infer NestedZoom>
  ? NestedZoom
  : never;

/**
 * Maps the provided compact URI to the appropriate relation name.
 *
 * @template Curie Compact URI to map (e.g. `fx:store`).
 */
export type ToRelation<Curie> = Curie extends keyof Reverse<Relations>
  ? Reverse<Relations>[Curie]
  : never;

/**
 * Foxy hAPI graph where each key is either a
 * relation name or a resource id and each value is either a nested
 * graph of linked resources or a never type marking the end of the branch.
 */
export interface ApiGraph<T extends ApiGraph = any> {
  [key: string]: never | T;
  [key: number]: T;
}

/**
 * Any resource received from the API that includes
 * a set of links to other resources (relations).
 */
export interface Followable {
  _links: {
    [key: string]: HalLink;
  };
}

/**
 * Constructs a helper record type including the properties of the
 * requested resource (identified by the compact URI) and limited to
 * the provided set of fields. If the latter isn't provided,
 * all fields will be included.
 *
 * @template Curie Compact URI of the resource to return properties for.
 * @template Fields Array of fields to include or `never | unknown` to include all.
 */
type ResourceProps<
  Curie extends PropertyKey,
  Fields extends OptionalArray = never
> = Curie extends keyof Props
  ? [Fields] extends [never]
    ? Props[Curie]
    : Fields extends OptionalArray<keyof Props[Curie]>
    ? Pick<Props[Curie], ArrayItem<Fields>>
    : Props[Curie]
  : {};

/**
 * Constructs a helper record type representing a hypermedia resource.
 * Separating this type from `Resource` is important to avoid infinite
 * type mapping error that occurs otherwise.
 *
 * @template Graph Hypermedia links graph record of the resource containing pointers to the linked resources.
 * @template Curie Compact URI identifying this resource.
 * @template Fields Array of fields to include or `never | unknown` to include all.
 * @template Embedded Embedded content to be included as-is under the `embedded` property.
 */
type ResourceBase<
  Graph extends ApiGraph,
  Curie extends PropertyKey,
  Fields extends OptionalArray = never,
  Embedded = never
> = ResourceProps<Curie, Fields> &
  OptionalProperty<"_embedded", Embedded> &
  OptionalProperty<"_links", Record<keyof Graph, HalLink>>;

/**
 * Constructs a helper record type representing embedded resources.
 * Also serves as a type for the `_embedded` property of the resource interface.
 * Handles both collections and single-resource embeds.
 *
 * @template Graph Hypermedia links graph record of the host resource containing pointers to the linked resources.
 * @template Curie Compact URI identifying the host resource.
 * @template Fields If constructing a collection embed type, an array of fields to include or `never | unknown` to include all. Ignored otherwise.
 */
type ResourceEmbeds<
  Graph extends ApiGraph,
  Curie extends PropertyKey,
  Fields extends OptionalArray = never,
  Zoom = never
> = Curie extends keyof Collections
  ? Record<Curie, Resource<ArrayItem<Graph>, Collections[Curie], Fields, Zoom>[]>
  : {
      [EmbeddedCurie in
        | ZoomCuries<Zoom>
        | Extract<
            keyof Graph,
            Fields extends any[] ? "" : DefaultZoom
          >]: EmbeddedCurie extends keyof Collections
        ? Array<
            Resource<
              ArrayItem<Graph[EmbeddedCurie]>,
              Collections[EmbeddedCurie],
              never,
              ZoomIn<Zoom, ToRelation<Collections[EmbeddedCurie]>>
            >
          >
        : Resource<
            Graph[EmbeddedCurie],
            EmbeddedCurie,
            never,
            ZoomIn<Zoom, ToRelation<EmbeddedCurie>>
          >;
    };

/**
 * Constructs a resource record type with the provided constraints applied.
 *
 * @template Graph Hypermedia links graph record of the resource containing pointers to the linked resources.
 * @template Curie Compact URI identifying this resource.
 * @template Fields Array of own fields to include or `never | unknown` to include all.
 * @template Zoom Additional resources to include in `_embedded` described as a zoom union type.
 */
export type Resource<
  Graph extends ApiGraph,
  Curie extends PropertyKey,
  Fields extends OptionalArray = never,
  Zoom = never
> = ResourceBase<Graph, Curie, Fields, ResourceEmbeds<Graph, Curie, Fields, Zoom>>;

/**
 * Constructs an array type which values are restricted to the keys
 * of the resource identified by the provided compact URI.
 *
 * @template Curie Compact URI identifying the target resource.
 */
export type Fields<Curie> = Curie extends keyof Props
  ? readonly (keyof Props[Curie])[]
  : Curie extends keyof Collections
  ? readonly (keyof Props[Collections[Curie]])[]
  : never;

/**
 * Constructs a union type describing possible order param
 * values for the given compact URI. Order can be expressed
 * as string, array or record.
 *
 * @template Curie Compact URI of the target resource.
 */
export type Order<Curie> =
  | ArrayItem<Fields<Curie>>
  | readonly (
      | ArrayItem<Fields<Curie>>
      | Partial<Record<ArrayItem<Fields<Curie>>, "asc" | "desc">>
    )[]
  | Partial<Record<ArrayItem<Fields<Curie>>, "asc" | "desc">>;

export type CodesDict = {
  [key: number]: {
    code: string;
    parent: string;
  };
};
