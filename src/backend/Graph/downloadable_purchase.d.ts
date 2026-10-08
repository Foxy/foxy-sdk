import type { Customer } from './customer';
import type { DownloadUrl } from './download_url';
import type { Downloadable } from './downloadable';
import type { Graph } from '../../core';
import type { Item } from './item';
import type { ResetUsage } from './reset_usage';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface DownloadablePurchase extends Graph {
  curie: 'fx:downloadable_purchase';

  links: {
    /** This resource. */
    'self': DownloadablePurchase;
    /** Related cart item. */
    'fx:item': Item;
    /** Store that provided the downloadable product. */
    'fx:store': Store;
    /** Customer who purchased the downloadable product. */
    'fx:customer': Customer;
    /** Related transaction. */
    'fx:transaction': Transaction;
    /** Downloadable product. */
    'fx:downloadable': Downloadable;
    /** POST to this URL to reset the usage count for this downloadable purchase. */
    'fx:reset_usage': ResetUsage;
    /** The URL to download the purchased item. */
    'fx:download_url': DownloadUrl;
  };

  props: {
    /** The number of times the customer attempted to download this item. This is useful for fine tuning your downloadables settings. */
    number_of_downloads: number;
    /** The time of the first download attempt by the customer. This is useful for fine tuning your downloadables settings. */
    first_download_time: string;
    /** This is the passcode for downloading this item after a purchase. To construct the download link, use `https://{store_domain}.foxycart.com/dl?p={download_passcode}` */
    download_passcode: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
