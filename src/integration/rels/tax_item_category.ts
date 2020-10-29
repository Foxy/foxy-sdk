import type { FxItemCategory } from './item_category';
import type { FxStore } from './store';
import type { FxTax } from './tax';

export interface FxTaxItemCategory {
  curie: 'fx:tax_item_category';

  links: {
    /** This resource. */
    'self': FxTaxItemCategory;
    /** Related tax resource. */
    'fx:tax': FxTax;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Related item category resource. */
    'fx:item_category': FxItemCategory;
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
