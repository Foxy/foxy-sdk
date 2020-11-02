import { APIGraph } from './APIGraph';
import { APIResourceLink } from './APIResourceLink';
import { With } from './utils';

/** Constructs part of the resource record that includes hAPI links. */
export type APIResourceLinks<TAPIGraph extends APIGraph> = TAPIGraph extends With<APIGraph, 'links'>
  ? {
      /** Links to related resources and actions. */
      _links: {
        [TLink in keyof TAPIGraph['links']]: APIResourceLink;
      };
    }
  : unknown;
