import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APIResourceEmbeds } from './APIResourceEmbeds';
import { APIResourceLinks } from './APIResourceLinks';
import { APIResourceProps } from './APIResourceProps';
import { With } from './utils';

/** Constructs a resource record for an embedded (child) graph node and query. */
export type APIResourceChild<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPIGraph extends With<APIGraph, 'child'>
  ? APIResourceChild<
      TAPIGraph['child'],
      {
        zoom: TAPINodeQuery extends With<APINodeQuery<TAPIGraph['child']>, 'zoom'> ? TAPINodeQuery['zoom'] : undefined;
        fields: TAPINodeQuery extends With<APINodeQuery<TAPIGraph['child']>, 'fields'>
          ? TAPINodeQuery['fields']
          : undefined;
      }
    >[]
  : APIResourceLinks<TAPIGraph> &
      APIResourceProps<TAPIGraph, TAPINodeQuery> &
      APIResourceEmbeds<TAPIGraph, TAPINodeQuery>;
