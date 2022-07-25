import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { GiftCardCodeLog } from './gift_card_code_log';
import type { Graph } from '../../core';

export interface GiftCardCodeLogs extends Graph {
  curie: 'fx:gift_card_code_logs';
  links: CollectionGraphLinks<GiftCardCodeLogs>;
  props: CollectionGraphProps;
  child: GiftCardCodeLog;
}
