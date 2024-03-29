import type { Graph as Customer } from './index';
import type { Graph } from '../../core';

export interface Attribute extends Graph {
  curie: 'fx:attribute';

  links: {
    /** This resource. */
    'self': Attribute;
    /** This customer. */
    'fx:customer': Customer;
  };

  props: {
    /** The name of this attribute. */
    name: string;
    /** The value of this attribute. */
    value: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
