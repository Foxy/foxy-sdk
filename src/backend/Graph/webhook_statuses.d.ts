import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { WebhookStatus } from './webhook_status';

export interface WebhookStatuses extends Graph {
  curie: 'fx:webhook_statuses';
  links: CollectionGraphLinks<WebhookStatuses>;
  props: CollectionGraphProps;
  child: WebhookStatus;
}
