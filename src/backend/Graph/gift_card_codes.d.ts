import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { GiftCardCode } from './gift_card_code';
import type { Graph } from '../../core';

export interface GiftCardCodes extends Graph {
  curie: 'fx:gift_card_codes';
  links: CollectionGraphLinks<GiftCardCodes>;
  props: CollectionGraphProps;
  child: GiftCardCode;
}

export interface GiftCardCodesImport extends Graph {
  curie: 'fx:gift_card_codes';

  props: {
    /** List of codes to import. */
    gift_card_codes: string[];
    /** Initial balance. */
    current_balance: number;
  };
}
