import type { Graph } from '../../core';
import type { Passkeys } from './passkeys';
import type { User } from './user';

export interface Passkey extends Graph {
  curie: 'fx:passkey';
  links: {
    'self': Passkey;
    'fx:user': User;
    'fx:user_passkeys': Passkeys;
  };
  props: {
    last_login_date: string | null;
    last_login_ua: string | null;
    credential_id: string;
    date_created: string | null;
    date_modified: string | null;
  };
}
