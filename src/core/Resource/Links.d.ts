import type { Graph } from '../Graph';
import type { Node } from '../API/Node';
import type { With } from '../utils';

/** Represents a hAPI relation link. */
type Link<TGraph extends Graph> = Node<TGraph> & {
  /** True if this is a template link (example: `https://api.foxycart.com/rels/{rel}`) */
  templated?: boolean;
  /** Short description of this link. */
  title?: string;
  /** For named links, this property will include link name. */
  name?: string;
  /** URL of the resource this link points to. */
  href: string;
};

/** Constructs part of the resource record that includes hAPI links. */
export type Links<TGraph extends Graph> = TGraph extends With<Graph, 'links'>
  ? {
      /** Links to related resources and actions. */
      _links: { [TLink in keyof TGraph['links']]: Link<TGraph['links'][TLink]> };
    }
  : unknown;
