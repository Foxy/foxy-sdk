import type * as FxDownloadable from "./downloadable";
import type * as FxTransaction from "./transaction";
import type * as FxCustomer from "./customer";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

export type Rel = "downloadable_purchase";
export type Curie = "fx:downloadable_purchase";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related cart item. */
  "fx:item": FxItem.Links;
  /** Store that provided the downloadable product. */
  "fx:store": FxStore.Links;
  /** Customer who purchased the downloadable product. */
  "fx:customer": FxCustomer.Links;
  /** Related transaction. */
  "fx:transaction": FxTransaction.Links;
  /** Downloadable product. */
  "fx:downloadable": FxDownloadable.Links;
}

export interface Props {
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
}

export type Zoom = never;
