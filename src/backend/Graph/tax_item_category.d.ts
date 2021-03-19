import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';
import type { Store } from './store';
import type { Tax } from './tax';

export interface TaxItemCategory extends Graph {
  curie: 'fx:tax_item_category';

  links: {
    /** This resource. */
    'self': TaxItemCategory;
    /** Related tax resource. */
    'fx:tax': Tax;
    /** Related store resource. */
    'fx:store': Store;
    /** Related item category resource. */
    'fx:item_category': ItemCategory;
  };

  props: {
    /** A full API URI of the item category resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    item_category_uri: string;
    /** A full API URI of the tax resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    store_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
