import type { Customer } from './customer';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Subscription } from './subscription';
import type { Transaction } from './transaction';
import type { Webhook } from './webhook';

export interface WebhookStatus extends Graph {
  curie: 'fx:webhook_status';

  links: {
    /** This resource. */
    'self': WebhookStatus;
    /** The store this webhook status is associated with. */
    'fx:store': Store;
    /** The webhook this status is associated with. */
    'fx:webhook': Webhook;
    /** The resource changes in which have triggered the webhook. */
    'fx:resource': Transaction | Subscription | Customer;
  };

  props: {
    /** The type of resource changes were observed on. */
    resource_type: 'subscription' | 'transaction' | 'customer';
    /** The ID of the resource changes in which have triggered the webhook. */
    resource_id: number;
    /** The ID of the webhook this status is associated with. */
    webhook_id: number;
    /** The current state of this attempt. */
    status: 'pending' | 'failed' | 'successful';
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    webhook?: Webhook;
  };
}
