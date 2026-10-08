import type { Graph } from '../../core';
import type { Store } from './store';
import type { WebhookLogs } from './webhook_logs';
import type { WebhookStatuses } from './webhook_statuses';
import type { Webhooks } from './webhooks';

export interface Webhook extends Graph {
  curie: 'fx:webhook';

  links: {
    /** This resource. */
    'self': Webhook;
    /** Store this webhook was created in. */
    'fx:store': Store;
    /** List of all webhooks for the store. */
    'fx:webhooks': Webhooks;
    /** List of all webhook delivery attempts and their current states. */
    'fx:statuses': WebhookStatuses;
    /** List of all endpoint responses received during webhook delivery attempts. */
    'fx:logs': WebhookLogs;
  };

  props: {
    /** The type of this webhook. Required. */
    format: 'json' | 'webflow' | 'zapier';
    /** The version of this webhook. Should not be modified unless you have specific instructions from Foxy. Default value is 2. */
    version: number;
    /** The name of this webhook. Required. 255 characters or less. */
    name: string;
    /** The endpoint where we will send the webhook data. 1000 characters or less. */
    url: string | null;
    /** The webhook payload mirrors the API, and you can include more or less data according to your needs (using `zoom` and other modifiers). 1000 characters or less. Something like `zoom=items,items:options,customer`. */
    query: string | null;
    /** The JSON webhooks are encrypted in certain situations. This key is also used to generate a signature to verify the integrity of the payload. 1000 characters or less. */
    encryption_key: string | null;
    /** The type of resource to observe changes on. */
    event_resource: 'subscription' | 'transaction' | 'transaction_log' | 'customer';
    /** If set to `0`, events will not be triggered for this webhook. This can also be set to `0` automatically if there are too many consecutive failed attempts to send a payload to this endpoint. */
    is_active: 0 | 1;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
