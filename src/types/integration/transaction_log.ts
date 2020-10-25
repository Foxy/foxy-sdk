import type * as FxTransactionLogDetails from "./transaction_log_details";
import type * as FxTransaction from "./transaction";
import type * as FxCustomer from "./customer";
import type * as FxStore from "./store";
import type * as FxUser from "./user";

type Curie = "fx:transaction_logs";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Related user resource. */
  "fx:user": FxUser.Graph;
  /** Relared store resource. */
  "fx:store": FxStore.Graph;
  /** Related customer resource. */
  "fx:customer": FxCustomer.Graph;
  /** Related transaction resource. */
  "fx:transaction": FxTransaction.Graph;
  /** List of detailed entries for this log. */
  "fx:transaction_log_details": FxTransactionLogDetails.Graph;
}

interface Props {
  /** A complete JSON snapshot of the transaction prior to the modification made this log entry records. It includes all of the following zoom values: `customer`, `payments`, `applied_taxes`, `discounts`, `shipments`, `billing_addresses`, `items`, `items:item_options`, `custom_fields`, `attributes`. */
  snapshot: string;
  /** Describes the source transaction modification such as admin or hAPI. */
  request_source: string;
  /** The date this resource was created. */
  date_created: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
