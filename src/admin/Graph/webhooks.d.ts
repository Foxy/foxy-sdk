import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Webhook } from './webhook';

export interface Webhooks extends Graph {
  curie: 'fx:webhooks';
  links: CollectionGraphLinks<Webhooks>;
  props: CollectionGraphProps;
  child: Webhook;
}
