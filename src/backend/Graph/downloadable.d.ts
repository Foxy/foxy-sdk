import type { DownloadableItemCategories } from './downloadable_item_categories';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';
import type { Store } from './store';

export interface Downloadable extends Graph {
  curie: 'fx:downloadable';

  links: {
    /** This resource. */
    'self': Downloadable;
    /** Store this downloadable product belongs to. */
    'fx:store': Store;
    /** Item category this downloadable product belongs to. */
    'fx:item_category': ItemCategory;
    /** List of all downloadable item categories in the store. */
    'fx:downloadable_item_categories': DownloadableItemCategories;
  };

  props: {
    /** The full API URI of the item category this product is part of. The item category must have an item delivery type of downloaded. */
    item_category_uri: string;
    /** The name of this downloadable. This will be shown to the customer in the cart. */
    name: string;
    /** The code for this downloadable. When adding this item to the cart, this is the code which will be used. */
    code: string;
    /** The item total for this downloadable. This is the amount the customer will pay to purchased this downloadable item. */
    price: number;
    /** The name of the file uploaded to our server. This is originally set when creating a downloadable with the `file` property. */
    file_name: string;
    /** The size of the file uploaded to our server. This is originally set when creating a downloadable with the `file` property. */
    file_size: number;
    /** The date this file was last uploaded. */
    upload_date: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
