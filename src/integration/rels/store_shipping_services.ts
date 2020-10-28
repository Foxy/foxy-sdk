import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxStoreShippingService } from "./store_shipping_service";

export interface FxStoreShippingServices {
  curie: "fx:store_shipping_services";
  links: CollectionLinks<FxStoreShippingServices>;
  props: CollectionProps;
  child: FxStoreShippingService;
}
