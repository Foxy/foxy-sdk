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
    /** Controls who can see this attribute. Only public attributes are accessible via this API. */
    visibility: 'public';
    /** The name of this attribute. */
    name: string;
    /** The value of this attribute. */
    value: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
