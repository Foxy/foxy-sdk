import type { CollectionLinks, CollectionProps } from "../index";
import type { FxShipment } from "./shipment";

export interface FxShipments {
  curie: "fx:shipments";
  links: CollectionLinks<FxShipments>;
  props: CollectionProps;
  child: FxShipment;
}
