import type { Graph } from '../Graph';
import type { Link } from './Link';
import type { With } from '../utils';

/** Constructs part of the resource record that includes hAPI links. */
export type Links<TGraph extends Graph> = TGraph extends With<Graph, 'links'>
  ? {
      /** Links to related resources and actions. */
      _links: { [TLink in keyof TGraph['links']]: Link };
    }
  : unknown;
