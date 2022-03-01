import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface GiftCardCodeLogs extends Graph {
  curie: 'fx:gift_card_code_logs';
  links: CollectionGraphLinks<GiftCardCodeLogs>;
  props: CollectionGraphProps;
  child: Transaction;
}
