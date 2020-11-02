import { KeyOf, RequiredKeyOf, With } from './utils';
import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';

/** Creates an intersection of relations included in the top level of the zoom query parameter. */
export type APIResourceZooms<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = Extract<
  TAPIGraph extends With<APIGraph, 'zooms'>
    ?
        | RequiredKeyOf<TAPIGraph['zooms']> // <-----------------------------------------| include all default embeds.
        | (TAPINodeQuery extends APINodeQuery<TAPIGraph> // <---------------------------| If there are query parameters,
            ? TAPINodeQuery extends With<APINodeQuery<TAPIGraph>, 'zoom'> // <----------| and one of them is zoom, also apply the following rules:
              ? TAPINodeQuery['zoom'] extends string // <-------------------------------| 1. For string values,
                ? TAPINodeQuery['zoom'] // <--------------------------------------------|    include them as-is;
                : TAPINodeQuery['zoom'] extends (infer R)[] // <------------------------| 2. For values like `[foo, { bar: baz }]`,
                ? Extract<R, string> | KeyOf<Extract<R, Record<string, unknown>>> // <--|    include `foo | bar` (top-level values and keys);
                : TAPINodeQuery['zoom'] extends Record<string, unknown> // <------------| 3. For values like `{ bar: baz, qux: bat }`,
                ? keyof TAPINodeQuery['zoom'] // <--------------------------------------|    include `bar | qux` (top-level keys).
                : never // <------------------------------------------------------------| In any other case,
              : never // <--------------------------------------------------------------| be it malformed input or empty query,
            : never) // <---------------------------------------------------------------| include default embeds only.
    : never,
  string
>;
