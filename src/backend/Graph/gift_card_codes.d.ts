import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { GiftCardCode } from './gift_card_code';
import type { Graph } from '../../core';

export interface GiftCardCodes extends Graph {
  curie: 'fx:gift_card_codes';
  links: CollectionGraphLinks<GiftCardCodes>;
  props: CollectionGraphProps;
  child: GiftCardCode;
}
