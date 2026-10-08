import type { Graph } from '../../core';
import type { Store } from './store';
import type { User } from './user';

export interface UserInvitation extends Graph {
  curie: 'fx:user_invitation';
  links: {
    'self': UserInvitation;
    'fx:user': User;
    'fx:store': Store;
    'fx:resend': { curie: 'fx:resend' };
    'fx:accept': { curie: 'fx:accept' };
    'fx:reject': { curie: 'fx:reject' };
    'fx:revoke': { curie: 'fx:revoke' };
  };
  props: {
    /* Read-only website URL of the store that the user is invited to. */
    store_url: string;
    /* Read-only name of the store that the user is invited to. */
    store_name: string;
    /* Read-only email of the store that the user is invited to. */
    store_email: string;
    /* Read-only (sub)domain of the store that the user is invited to. */
    store_domain: string;
    /* Read-only first name of the user that is invited. */
    first_name: string | null;
    /* Read-only last name of the user that is invited. */
    last_name: string | null;
    /* Read-only email of the user that is invited. */
    email: string;
    /* Read-only status of the invitation, `sent` on creation. Use POST actions in links to change the status. */
    status: 'sent' | 'accepted' | 'rejected' | 'revoked' | 'expired';
    /* Read-only date the invitation was created. */
    date_created: string;
    /* Read-only date the invitation was last modified. */
    date_modified: string;
  };
}
