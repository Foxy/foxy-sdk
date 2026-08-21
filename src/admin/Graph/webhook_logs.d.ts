import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { WebhookLog } from './webhook_log';

export interface WebhookLogs extends Graph {
  curie: 'fx:webhook_logs';
  links: CollectionGraphLinks<WebhookLogs>;
  props: CollectionGraphProps;
  child: WebhookLog;
}
