import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CouponCodeTransaction } from './coupon_code_transaction';
import type { Graph } from '../../core';

export interface CouponCodeTransactions extends Graph {
  curie: 'fx:coupon_code_transactions';
  links: CollectionGraphLinks<CouponCodeTransactions>;
  props: CollectionGraphProps;
  child: CouponCodeTransaction;
}
