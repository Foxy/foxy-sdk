import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCouponCodeTransaction } from './coupon_code_transaction';
import type { Graph } from '../../core';

export interface FxCouponCodeTransactions extends Graph {
  curie: 'fx:coupon_code_transactions';
  links: CollectionGraphLinks<FxCouponCodeTransactions>;
  props: CollectionGraphProps;
  child: FxCouponCodeTransaction;
}
