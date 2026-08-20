import { KeyOf, RequiredKeyOf, With } from '../utils';
import { Graph } from '../Graph';
import { Query } from '../Query';

/** Creates an intersection of relations included in the top level of the zoom query parameter. */
export type Zooms<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = Extract<
  TGraph extends With<Graph, 'zooms'>
    ?
        | RequiredKeyOf<TGraph['zooms']> // <---------------------------------------------| include all default embeds.
        | (TQuery extends Query<TGraph> // <----------------------------------------------| If there are query parameters,
            ? TQuery extends With<Query<TGraph>, 'zoom'> // <-----------------------------| and one of them is zoom, also apply the following rules:
              ? TQuery['zoom'] extends string // <----------------------------------------| 1. For string values,
                ? TQuery['zoom'] // <-----------------------------------------------------|    include them as-is;
                : TQuery['zoom'] extends (infer R)[] // <---------------------------------| 2. For values like `[foo, { bar: baz }]`,
                ? Extract<R, string> | KeyOf<Extract<R, Record<string, unknown>>> // <----|    include `foo | bar` (top-level values and keys);
                : TQuery['zoom'] extends Record<string, unknown> // <---------------------| 3. For values like `{ bar: baz, qux: bat }`,
                ? keyof TQuery['zoom'] // <-----------------------------------------------|    include `bar | qux` (top-level keys).
                : never // <--------------------------------------------------------------| In any other case,
              : never // <----------------------------------------------------------------| be it malformed input or empty query,
            : never) // <-----------------------------------------------------------------| include default embeds only.
    : never,
  string
>;
