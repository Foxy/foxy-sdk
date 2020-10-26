import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCouponCodeTransaction } from "./coupon_code_transaction";

export interface FxCouponCodeTransactions {
  curie: "fx:coupon_code_transactions";
  links: CollectionLinks<FxCouponCodeTransactions>;
  props: CollectionProps;
  child: FxCouponCodeTransaction;
}
