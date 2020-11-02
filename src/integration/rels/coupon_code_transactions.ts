import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCouponCodeTransaction } from './coupon_code_transaction';

export interface FxCouponCodeTransactions extends APIGraph {
  curie: 'fx:coupon_code_transactions';
  links: APICollectionGraphLinks<FxCouponCodeTransactions>;
  props: APICollectionGraphProps;
  child: FxCouponCodeTransaction;
}
