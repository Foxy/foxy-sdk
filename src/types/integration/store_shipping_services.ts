import type * as FxStoreShippingService from "./store_shipping_service";

type Curie = "fx:store_shipping_services";

interface Links {
  /** This collection. */
  self: Graph;
  /** First page of this collection. */
  first: Graph;
  /** Previous page of this collection. */
  prev: Graph;
  /** Next page of this collection. */
  next: Graph;
  /** Last page of this collection. */
  last: Graph;
}

interface Props {
  /** Total number of resources in this collection. */
  total_items: number;
  /** Number of items returned with this response. */
  returned_items: number;
  /** Maximum allowed number of items for this query. */
  limit: number;
  /** Number of skipped items. */
  offset: number;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  child: FxStoreShippingService.Graph;
}
