import type * as FxTransaction from "./transaction";
import type * as FxStore from "./store";
import type * as FxTax from "./tax";

type Curie = "fx:applied_tax";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Tax configuration. */
  "fx:tax": FxTax.Graph;
  /** Store that handled the transaction this tax applies to. */
  "fx:store": FxStore.Graph;
  /** Transaction this tax applies to. */
  "fx:transaction": FxTransaction.Graph;
}

interface Props {
  /** The tax rate as a percentage for this applied tax. As an example, a 9.75% tax rate would be displayed as 9.75. */
  rate: number;
  /** The original tax name of this tax. */
  name: string;
  /** The amount of tax applied to the transaction. Note, this amount is not rounded to the specific currency decimal precision. */
  amount: number;
  /** Whether or not this tax was also applied to the handling fees for the transaction. */
  apply_to_handling: boolean;
  /** Whether or not this tax was also applied to the shipping fees for the transaction. */
  apply_to_shipping: boolean;
  /** Whether or not this applied tax is part of a subscription that is to be charged in the future based on when this transaction was processed. */
  is_future_tax: boolean;
  /** If this tax only applied to a specific shipto shipment, the shipto address name will be listed here. */
  shipto: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
