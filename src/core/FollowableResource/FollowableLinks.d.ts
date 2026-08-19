import type { Graph } from '../Graph';
import type { Link } from '../Resource/Link';
import type { Node } from '../API/Node';
import type { With } from '../utils';

type NodeMethods = 'delete' | 'follow' | 'get' | 'patch' | 'post' | 'put';

/** Constructs part of the resource record that includes hAPI links. */
export type FollowableLinks<TGraph extends Graph> = TGraph extends With<Graph, 'links'>
  ? {
      /** Links to related resources and actions. */
      _links: {
        [TLink in keyof TGraph['links']]: Link & Pick<Node<TGraph['links'][TLink]>, NodeMethods>;
      };
    }
  : unknown;
