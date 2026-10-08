import type { Graph } from '../../core';

export interface SendWebhooks extends Graph {
  curie: 'fx:send_webhooks';
  props: {
    refeed_hooks: number[];
    event: string;
  };
}
