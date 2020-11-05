import type { FxCustomer } from './customer';
import type { FxDownloadable } from './downloadable';
import type { FxItem } from './item';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';
import type { Graph } from '../../core';

export interface FxDownloadablePurchase extends Graph {
  curie: 'fx:downloadable_purchase';

  links: {
    /** This resource. */
    'self': FxDownloadablePurchase;
    /** Related cart item. */
    'fx:item': FxItem;
    /** Store that provided the downloadable product. */
    'fx:store': FxStore;
    /** Customer who purchased the downloadable product. */
    'fx:customer': FxCustomer;
    /** Related transaction. */
    'fx:transaction': FxTransaction;
    /** Downloadable product. */
    'fx:downloadable': FxDownloadable;
  };

  props: {
    /** The number of times the customer attempted to download this item. This is useful for fine tuning your downloadables settings. */
    number_of_downloads: number;
    /** The time of the first download attempt by the customer. This is useful for fine tuning your downloadables settings. */
    first_download_time: string;
    /** This is the passcode for downloading this item after a purchase. To construct the download link, use `https://{store_domain}.foxycart.com/dl?p={download_passcode}` */
    download_passcode: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
